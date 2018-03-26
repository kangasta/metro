import React from 'react';

import './DestinationUtils.css';

class DestinationUtils {
	static getDestinationText(destination) {
		return destination.split('via')[0].replace('(M)','');
	}

	static getDestinationMetroSymbol(destination) {
		if (destination.split('via')[0].search(/\(M\)/) !== -1)
			return <div className='destination-utils-m-symbol'>M</div>;
		return '';
	}
}

export default DestinationUtils;
