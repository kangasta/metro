import React from 'react';
import { mount } from 'enzyme';

import DestinationUtils from '../DestinationUtils';

describe('DestinationUtils.getDestinationText',()=>{
	it('parses intermediate stops and (M)',()=>{
		const destination = 'TTY (M) via Hervanta';
		const result = DestinationUtils.getDestinationText(destination);
		expect(result).not.toMatch(/\(M\)/);
		expect(result).not.toMatch(/via/);
		expect(result).not.toMatch(/Hervanta/);
	});
});

describe('DestinationUtils.getDestinationMetroSymbol',()=>{
	it('Returns metro symbol div if destination is (M) station',()=>{
		const destinations = ['Hervanta','TTY (M)'];
		for (var i = 0; i < destinations.length; i++) {
			const wrapper = mount(
				<div>
					{DestinationUtils.getDestinationMetroSymbol(destinations[i])}
				</div>
			);
			expect(wrapper.find('.destination-utils-m-symbol').exists()).toBe(Boolean(i));
		}
	});
});
