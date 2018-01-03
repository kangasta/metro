import LocationUtils from '../LocationUtils';

describe('LocationUtils.getCoords',()=>{
	it('rejects if geolocation not available',()=>{
		return LocationUtils.getCoords().catch((error_json)=>{
			expect(error_json.hasOwnProperty('error')).toBe(true);
		});
	});
	it('rejects if get current position fails',()=>{
		const mockGeolocation = {
			getCurrentPosition: jest.fn((_,error)=>{
				error();
			})
		};
		const realGeoLocation = global.navigator.geolocation;
		global.navigator.geolocation = mockGeolocation;

		return LocationUtils.getCoords().catch((error_json)=>{
			expect(error_json.hasOwnProperty('error')).toBe(true);
			global.navigator.geolocation = realGeoLocation;
		});
	});
	it('resolves when geolocation available',()=>{
		const mockGeolocation = {
			getCurrentPosition: jest.fn((success)=>{
				success({coords: {latitude: 60, longitude: 24}});
			})
		};
		const realGeoLocation = global.navigator.geolocation;
		global.navigator.geolocation = mockGeolocation;

		return LocationUtils.getCoords().then((location)=>{
			expect(location.lat).toBe(60);
			expect(location.lon).toBe(24);
			global.navigator.geolocation = realGeoLocation;
		});
	});
});