import React, { Component } from 'react';
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
		this.getCoords()
			.then(()=>{
				this.setState({data: {loading: 'Loading HSL data.'}});
			})
			.then(()=>{
				this.sendQueryAndUpdateState();
			})
			.catch(()=>{
				this.errorIfNotError();
			});

		this.setState({queryIntervalId: setInterval(() => {
			this.sendQueryAndUpdateState();
		}, 15000)});
		this.setState({coordsIntervalId: setInterval(() => {
			this.getCoords()
				.catch(()=>{
					this.errorIfNotError();
				});
		}, 60000)});
	}

	componentWillUnmount() {
		clearInterval(this.state.queryIntervalId);
		clearInterval(this.state.coordsIntervalId);
	}

	errorIfNotError() {
		if (this.state.data.hasOwnProperty('error')) return;
		this.setState({data: {error: 'Unhandled error.'}});
	}

	getCoords() {
		return (new Promise((resolve, reject)=>{
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position)=>{
					this.setState({
						coords: {
							lat:Math.round(position.coords.latitude*1e6)/1e6,
							lon:Math.round(position.coords.longitude*1e6)/1e6,
							r:2000
						}
					},resolve);
				}, ()=>{
					this.setState({data: {error: 'No location detected.'}},reject);
				});
			} else {
				this.setState({data: {error: 'Geolocation not available.'}},reject);
			}
		}));
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
				body: this.getQuery(this.state.coords.lat,this.state.coords.lon,this.state.coords.r)
			})
				.then(response => response.json())
				.then((responseJson) => {
					if (responseJson.hasOwnProperty('errors')){
						this.setState({data: {error: 'Error response from HSL API.'}});
					}
					return responseJson.data;
				})
				.then((data)=>{
					var vehicleType = 1;
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
					var departures = [];
					for (var i = 0; i < 2; i++)
						departures = departures.concat(stops[i].node.stop.stoptimesForPatterns[0].stoptimes);
					departures.sort((a,b)=>{
						if (a.realtimeDeparture < b.realtimeDeparture) return -1;
						if (a.realtimeDeparture > b.realtimeDeparture) return 1;
						return 0;
					});

					this.setState({data: {
						location: location,
						vehicle_type: vehicleType,
						departures: departures
							.filter(departure=>departure.headsign)
							.map(departure => {
								var rt_dep = departure.realtimeDeparture / 60;
								rt_dep = rt_dep >= App.currentTimeInMinutes() ?
									rt_dep :
									rt_dep + 24*60;
								return {
									destination: departure.headsign,
									leaves_in: (rt_dep - App.currentTimeInMinutes()),
									is_realtime: departure.realtime,
									action: ()=>undefined
								};
							})
					}});
				});
		}
	}

	static currentTimeInMinutes() {
		const curTime = new Date();
		const h = curTime.getHours();
		return ((h < 4) ? (h + 24) : h )*60 + curTime.getMinutes();
	}

	getQuery(lat, lon, r=1500) {
		return (
			'{stopsByRadius(lat: ' + lat.toString() + ', lon: ' + lon.toString() + ', radius: ' + r.toString() + ') { ' +
			'edges { node { distance stop { name vehicleType stoptimesForPatterns { pattern { alerts { alertHeaderText } } stoptimes { realtimeDeparture realtime headsign } } } } } }' +
			'}'
		);
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

	getMSymbol() {
		// Prepare for train station support:
		// Symbol for train station '\uD83D\uDE89\uFE0E'
		return 'M';
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
			<div className='app app-theme-metro'>
				<div className='app-content'>
					<div className={'app-head ' + (this.isLoading() ? 'app-effect-blink' : '')}>
						<div className='app-head-m'>{this.getMSymbol()}</div>
						<div className='app-head-location'>{this.getLocationString()}</div>
					</div>
					{departures.slice(0,4).map((departure, i) => (
						<div key={i}
							className={
								'app-row' +
								' ' + ((departure.leaves_in <= 2) ? 'app-effect-blink' : '') +
								' ' + (departure.hasOwnProperty('coords') ? 'app-effect-link' : '')}
							onClick={departure.hasOwnProperty('coords') ?
								()=>{ this.setCoords(departure.coords); } :
								()=>undefined
							}
						>
							<div className={'app-row-min ' + (departure.is_realtime ? 'app-row-min-rt' : '')}>
								{departure.leaves_in}
							</div>
							<div className='app-row-dest'>
								{departure.destination}
							</div>
						</div>
					))}
					<div className='app-footer'>
						<a className='app-effect-link' href='https://github.com/kangasta/metro'>kangasta / metro</a>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
