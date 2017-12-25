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
			}
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
					const vehicleTypes = [HslApiUtils.VT_METRO, HslApiUtils.VT_TRAIN, HslApiUtils.VT_TRAM, HslApiUtils.VT_BUS];
					for (var i = 0; i < vehicleTypes.length && !HslApiUtils.checkStopResponseForVehicleType(data, vehicleTypes[i]); i++);
					var vehicleType = vehicleTypes[i];
					var stops = data.stopsByRadius.edges.filter(a => {
						return a.node.stop.vehicleType === vehicleType;
					});
					if (!stops.length) {
						this.setState({data: {error: 'No nearby stops.'}});
						return;
					}

					stops.sort((a,b)=>{
						if (a.node.distance < b.node.distance) return -1;
						if (a.node.distance > b.node.distance) return 1;
						return 0;
					});
					const location = stops[0].node.stop.name;
					stops = stops.filter((stop)=>{
						return stop.node.stop.name === location;
					});
					var departures = [];
					for (i = 0; i < stops.length; i++)
						departures = departures.concat(stops[i].node.stop.stoptimesWithoutPatterns);
					departures.sort((a,b)=>{
						if (HslApiUtils.fixDepartureTimeToMatchDate(a.realtimeDeparture/60) < HslApiUtils.fixDepartureTimeToMatchDate(b.realtimeDeparture/60)) return -1;
						if (HslApiUtils.fixDepartureTimeToMatchDate(a.realtimeDeparture/60) > HslApiUtils.fixDepartureTimeToMatchDate(b.realtimeDeparture/60)) return 1;
						return 0;
					});

					departures = HslApiUtils.filterOutStoptimesWithoutPatternsDuplicates(departures);

					this.setState({data: {
						location: location,
						vehicle_type: vehicleType,
						departures: departures
							.filter(departure=>departure.headsign)
							.map(departure => {
								var rt_dep = HslApiUtils.fixDepartureTimeToMatchDate(departure.realtimeDeparture / 60);
								return {
									destination: departure.headsign,
									route: departure.trip.route.shortName,
									leaves_in: Math.round(rt_dep - HslApiUtils.currentTimeInMinutes()),
									is_realtime: departure.realtime,
									vehicle_type: vehicleType,
									action: ()=>undefined
								};
							})
					}});
				});
		}
	}

	getLocationString() {
		if (this.state.data.hasOwnProperty('error'))
			return this.state.data.error;
		if (this.state.data.hasOwnProperty('loading'))
			return this.state.data.loading;
		if (this.state.data.hasOwnProperty('waiting'))
			return this.state.data.waiting;
		if (!this.state.data.location)
			return 'No nearby stations.';
		return this.state.data.location;
	}

	getSymbol() {
		if (!this.state.data.hasOwnProperty('vehicle_type'))
			return HslApiUtils.LoadingImg;
		switch(this.state.data.vehicle_type) {
		case HslApiUtils.VT_METRO:
			return HslApiUtils.MetroImg;
		case HslApiUtils.VT_TRAM:
			return HslApiUtils.TramImg;
		case HslApiUtils.VT_TRAIN:
			return HslApiUtils.TrainImg;
		case HslApiUtils.VT_BUS:
			return HslApiUtils.BusImg;
		default:
			return HslApiUtils.LoadingImg;
		}
	}

	getTheme() {
		if (!this.state.data.hasOwnProperty('vehicle_type')) return 'default';
		switch(this.state.data.vehicle_type) {
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

	isLoading() {
		if (this.state.data.hasOwnProperty('loading') || this.state.data.hasOwnProperty('waiting'))
			return true;
		return false;
	}

	render() {
		var departures = require('./menuitems.json');
		if (this.state.data.hasOwnProperty('departures') && this.state.data.departures.length) {
			departures = this.state.data.departures;
		}
		return (
			<div className={'app theme-' + this.getTheme()}>
				<div className='app-background'/>
				<div className='app-content'>
					<div className={'app-head'}>
						<div className='app-head-m'>
							{this.getSymbol()}
						</div>
						<div className='app-head-location'>{this.getLocationString()}</div>
					</div>
					{departures.slice(0,5).map((departure, i) => (
						<DepartureRow
							key={i}
							departure={departure}
							onClickCallback={departure.hasOwnProperty('coords') ?
								()=>{ this.setCoords(departure.coords); } :
								()=>undefined
							}
						/>
					))}
					<div className='app-footer'>
						<a className='effect-link' href='https://github.com/kangasta/metro'>kangasta / metro</a>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
