import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import './DepartureRow.css';
import HslApiUtils from './HslApiUtils';
import DestinationUtils from './DestinationUtils';

class DepartureRow extends Component {
	getBlinkClass() {
		if ((this.props.departure.leaves_in || this.props.departure.leaves_in === 0) && this.props.departure.leaves_in <= 2)
			return ' effect-blink';
		return '';
	}

	getLinkClass() {
		if (!this.props.departure.leaves_in && this.props.departure.leaves_in !== 0)
			return ' effect-link';
		return '';
	}

	getRealtimeClass() {
		if (this.props.departure.is_realtime)
			return ' departure-row-min-rt';
		return '';
	}

	getHHmmClass() {
		if (this.props.departure.leaves_in && this.props.departure.leaves_in >= 60)
			return ' departure-row-min-HHmm';
		return '';
	}

	getLeavesInContent() {
		if (this.props.departure.leaves_in || this.props.departure.leaves_in === 0) {
			var min = this.props.departure.leaves_in;
			min = (min < 60) ? min : moment().add(min,'m').format('HH:mm');
			return min;
		}
		return HslApiUtils.getSymbol(this.props.departure.vehicle_type);
	}

	getHasPlatformClass() {
		if (this.props.departure.platform)
			return ' departure-row-dest-with-platform';
		return '';
	}

	render() {
		return (
			<div
				className={'departure-row' + this.getBlinkClass() + this.getLinkClass()}
				onClick={this.props.onClickCallback}
			>
				<div className={'departure-row-min ' + this.getRealtimeClass() + this.getHHmmClass()}>
					{this.getLeavesInContent()}
				</div>
				<div className='departure-row-route'>
					{this.props.departure.route}
				</div>
				<div className='departure-row-dest'>
					<div className={'departure-row-dest-text ' + this.getHasPlatformClass()}>
						{DestinationUtils.getDestinationText(this.props.departure.destination)}
						{DestinationUtils.getDestinationMetroSymbol(this.props.departure.destination)}
					</div>
					<div className={'departure-row-dest-platform ' + this.getHasPlatformClass()}>
						Platform {this.props.departure.platform}
					</div>
				</div>
			</div>
		);
	}
}

DepartureRow.defaultProps = {
	onClickCallback: ()=>undefined
};

DepartureRow.propTypes = {
	departure: PropTypes.object,
	onClickCallback: PropTypes.func
};



export default DepartureRow;
