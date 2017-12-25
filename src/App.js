import React, { Component } from 'react';

import DepartureRow from './DepartureRow';
import HslApiUtils from './HslApiUtils';
import LocationUtils from './LocationUtils';

import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: {
				waiting: 'Waiting location.'
			},
			settings: {}
		};
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
					this.state.coords.lat, this.state.coords.lon, 2000)
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
		const vehicleTypes = [HslApiUtils.VT_METRO, HslApiUtils.VT_TRAIN, HslApiUtils.VT_TRAM, HslApiUtils.VT_BUS];
		for (var i = 0; i < vehicleTypes.length && !HslApiUtils.checkStopResponseForVehicleType(this.state.data, vehicleTypes[i]); i++);
		return vehicleTypes[i];
	}

	getLocation() {
		const vehicleType = this.getVehicleType();
		if (!vehicleType) return undefined;
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

	getTheme() {
		switch(this.getVehicleType()) {
		case HslApiUtils.VT_METRO:
			return 'metro';
		case HslApiUtils.VT_TRAM:
			return 'tram';
		case HslApiUtils.VT_TRAIN:
			return 'train';
		case HslApiUtils.VT_BUS:
			return 'bus';
		default:
			return 'default';
		}
	}

	getDepartureRowList(departures, a, b) {
		return departures.slice(a,b).map((departure, i) => (
			<DepartureRow
				key={i}
				departure={departure}
				onClickCallback={departure.hasOwnProperty('coords') ?
					()=>{ this.setCoords(departure.coords); } :
					()=>undefined
				}
			/>
		));
	}

	isLoading() {
		return (this.state.data.hasOwnProperty('loading') || this.state.data.hasOwnProperty('waiting'));
	}

	isError() {
		return (this.state.data.hasOwnProperty('error'));
	}

	render() {
		var departures = require('./menuitems.json');
		if (!this.isLoading() && !this.isError() && this.getLocation()) {
			departures = this.getDepartures();
		}
		return (
			<div className={'app theme-' + this.getTheme()}>
				<div className='app-background'/>
				<div className='app-col'>
					<div className={'app-head'}>
						<div className='app-head-m'>
							{HslApiUtils.getSymbol(this.getVehicleType())}
						</div>
						<div className='app-head-location'>{this.getLocationString()}</div>
					</div>
					{this.getDepartureRowList(departures,0,6)}
				</div>
				{[6,15].map((first,i)=>{
					return (
						<div key={i} className='effect-landscape-only'>
							<div className='app-col'>
								{this.getDepartureRowList(departures,first,first+9)}
							</div>
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
