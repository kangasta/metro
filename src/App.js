import React, { Component } from 'react';

import DepartureRow from './DepartureRow';
import HslApiUtils from './HslApiUtils';
import LocationUtils from './LocationUtils';
import StopInfo from './StopInfo';

import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: {
				waiting: 'Waiting location.'
			},
			settings: {
				preferredVehicleType: HslApiUtils.VT_NONE
			},
			menu_screen: null
		};

		this.choosePreferredVT = this.choosePreferredVT.bind(this);
		this.choosePreferredStop = this.choosePreferredStop.bind(this);
	}

	componentDidMount() {
		this.updateCoords().then(()=>{
			this.sendQueryAndUpdateState();
		});

		this.setState({queryIntervalId: setInterval(() => {
			this.sendQueryAndUpdateState();
		}, 15000)});
		this.setState({coordsIntervalId: setInterval(() => {
			this.updateCoords();
		}, 60000)});
	}

	updateCoords(set_loading=false) {
		return LocationUtils.getCoords()
			.then((coords)=>{
				this.setState({coords: coords});
				if (set_loading) this.setState({
					data: {loading: 'Loading HSL data.'}
				});
			})
			.catch((error_json)=>{
				this.setState({data: error_json});
			});
	}

	componentWillUnmount() {
		clearInterval(this.state.queryIntervalId);
		clearInterval(this.state.coordsIntervalId);
	}

	errorIfNotError() {
		if (this.state.data.hasOwnProperty('error')) return;
		this.setState({data: {error: 'Unhandled error.'}});
	}

	setCoords(coords) {
		this.setState({coords: coords},()=>{
			if (this.state.hasOwnProperty('coordsIntervalId'))
				clearInterval(this.state.coordsIntervalId);
			this.sendQueryAndUpdateState();
		});
	}

	sendQueryAndUpdateState() {
		const APIurl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

		if (this.state.hasOwnProperty('coords')) {
			fetch(APIurl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/graphql'
				},
				body: HslApiUtils.getStopsByRadiusQuery(
					this.state.coords.lat, this.state.coords.lon, 2000, 20)
			})
				.then(response => response.json())
				.then((responseJson) => {
					if (responseJson.hasOwnProperty('errors')){
						this.setState({data: {error: 'Error from HSL API.'}});
					}
					return responseJson.data;
				})
				.then((data)=>{
					this.setState({data: data});
				});
		}
	}

	getVehicleType() {
		if (this.isLoading() || this.isError()) return undefined;
		const vehicleTypes = [
			this.state.settings.preferredVehicleType,
			HslApiUtils.VT_METRO,
			HslApiUtils.VT_TRAIN,
			HslApiUtils.VT_TRAM,
			HslApiUtils.VT_BUS
		];
		for (var i = 0; i < vehicleTypes.length && !HslApiUtils.checkStopResponseForVehicleType(this.state.data, vehicleTypes[i]); i++);
		return vehicleTypes[i];
	}

	getLocation() {
		if (this.state.settings.hasOwnProperty('selectedStop'))
			return this.state.settings.selectedStop;
		const vehicleType = this.getVehicleType();
		if (!vehicleType && vehicleType !== 0) return undefined;
		var stops = this.state.data.stopsByRadius.edges.filter(a => {
			return a.node.stop.vehicleType === vehicleType;
		});
		if (!stops.length) {
			this.setState({data: {error: 'No nearby stops.'}});
			return undefined;
		}
		return stops[0].node.stop.name;
	}

	getDepartures() {
		const vehicleType = this.getVehicleType();
		const location = this.getLocation();
		if (!location) return [];

		var stops = this.state.data.stopsByRadius.edges.filter(a => {
			return a.node.stop.vehicleType === vehicleType;
		});

		stops = stops.filter((stop)=>{
			return stop.node.stop.name === location;
		});
		var departures = [];
		for (var i = 0; i < stops.length; i++)
			departures = departures.concat(stops[i].node.stop.stoptimesWithoutPatterns);

		departures = HslApiUtils.sortCombinedStoptimesWithoutPatterns(departures);

		departures = HslApiUtils.filterOutStoptimesWithoutPatternsDuplicates(departures);

		return (
			departures
				.filter(departure=>departure.headsign)
				.map(departure => {
					var rt_dep = HslApiUtils.fixDepartureTimeToMatchDate(departure.realtimeDeparture / 60);
					return {
						destination: departure.headsign,
						route: departure.trip.route.shortName,
						leaves_in: HslApiUtils.leavesIn(rt_dep),
						is_realtime: departure.realtime,
						vehicle_type: vehicleType,
						action: ()=>undefined
					};
				})
		);
	}

	getLocationString() {
		if (this.state.menu_screen)
			return this.state.menu_screen.info;
		if (this.state.data.hasOwnProperty('error'))
			return this.state.data.error;
		if (this.state.data.hasOwnProperty('loading'))
			return this.state.data.loading;
		if (this.state.data.hasOwnProperty('waiting'))
			return this.state.data.waiting;
		if (!this.getLocation())
			return 'No nearby stations.';
		return this.getLocation();
	}

	getDepartureRowList(departures, a, b) {
		return departures.slice(a,b).map((departure, i) => (
			<DepartureRow
				key={i}
				departure={departure}
				onClickCallback={departure.hasOwnProperty('coords') ?
					()=>{ this.setCoords(departure.coords); } :
					(this.state.menu_screen ?
						()=>{this.state.menu_screen.callback(departure);} :
						()=>undefined)
				}
			/>
		));
	}

	choosePreferredVT() {
		this.setState({menu_screen: {
			info: 'Select preferation:',
			options: require('./preferredmenu.json'),
			callback: (departure)=>{
				this.setState({
					settings: {preferredVehicleType: departure.vehicle_type},
					menu_screen: null
				});
			}
		}});
	}

	choosePreferredStop() {
		if (this.isLoading() || this.isError()) return;
		this.setState({menu_screen: {
			info: 'Select stop:',
			options: HslApiUtils.getListOfStopsAvailable(this.state.data),
			callback: (departure)=>{
				this.setState({
					settings: {
						selectedStop: departure.destination,
						preferredVehicleType: departure.vehicle_type
					},
					menu_screen: null
				});
			}
		}});
	}

	isLoading() {
		return (this.state.data.hasOwnProperty('loading') || this.state.data.hasOwnProperty('waiting') || this.state.menu_screen);
	}

	isError() {
		return (this.state.data.hasOwnProperty('error'));
	}

	render() {
		var departures = require('./menuitems.json');
		if (!this.isLoading() && !this.isError() && this.getLocation()) {
			departures = this.getDepartures();
		} else if (this.state.menu_screen)
			departures = this.state.menu_screen.options;
		return (
			<div className={'app theme-' + HslApiUtils.getTheme(this.getVehicleType())}>
				<div className='app-background'/>
				<div className='app-col'>
					<StopInfo
						leftSymbol={HslApiUtils.getSymbol(this.state.settings.preferredVehicleType)}
						mainSymbol={HslApiUtils.getSymbol(this.getVehicleType())}
						mainSymbolOnClickCallback={this.choosePreferredVT}
						locationText={this.getLocationString()}
						locationTextOnClickCallback={this.choosePreferredStop}
					/>
					{this.getDepartureRowList(departures,0,6)}
				</div>
				{[6,15].map((first,i)=>{
					return (
						<div key={i}
							className={'app-col effect-landscape-only ' +
								((first >= departures.length) ? 'app-col-empty' : '')}>
							{this.getDepartureRowList(departures,first,first+9)}
						</div>
					);
				})}
				<div className='app-footer'>
					<a className='effect-link' href='https://github.com/kangasta/metro'>kangasta / metro</a>
				</div>
			</div>
		);
	}
}

export default App;
