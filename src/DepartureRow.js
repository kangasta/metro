import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './DepartureRow.css';
import HslApiUtils from './HslApiUtils';

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

	getLeavesInContent() {
		if (this.props.departure.leaves_in || this.props.departure.leaves_in === 0)
			return this.props.departure.leaves_in;
		return HslApiUtils.getSymbol(this.props.departure.vehicle_type);

	}

	render() {
		return (
			<div
				className={'departure-row' + this.getBlinkClass() + this.getLinkClass()}
				onClick={this.props.onClickCallback}
			>
				<div className={'departure-row-min ' + this.getRealtimeClass()}>
					{this.getLeavesInContent()}
				</div>
				<div className='departure-row-route'>
					{this.props.departure.route}
				</div>
				<div className='departure-row-dest'>
					<span className='departure-row-dest-text'>
						{this.props.departure.destination}
					</span>
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
