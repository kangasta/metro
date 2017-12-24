import LocationUtils from '../LocationUtils';

describe('LocationUtils.getCoords',()=>{
	it('rejects if geolocation not available',()=>{
		return LocationUtils.getCoords().catch((error_json)=>{
			expect(error_json.hasOwnProperty('error')).toBe(true);
		});
	});
});