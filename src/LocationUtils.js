class LocationUtils {
	static getCoords() {
		return (new Promise((resolve, reject)=>{
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position)=>{
					resolve({
						lat:Math.round(position.coords.latitude*1e6)/1e6,
						lon:Math.round(position.coords.longitude*1e6)/1e6,
					});
				}, ()=>{reject({error: 'No location detected.'});});
			} else {
				reject({error: 'No locating suppport.'});
			}
		}));
	}
}

export default LocationUtils;
