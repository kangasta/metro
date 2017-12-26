import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './DepartureRow.css';
import HslApiUtils from './HslApiUtils';

class DepartureRow extends Component {
	render() {
		return (
			<div
				className={
					'departure-row' +
					' ' + (((this.props.departure.leaves_in || this.props.departure.leaves_in === 0) && this.props.departure.leaves_in <= 2) ? 'effect-blink' : '') +
					' ' + ((!this.props.departure.leaves_in && this.props.departure.leaves_in !== 0) ? 'effect-link' : '')}
				onClick={this.props.onClickCallback}
			>
				<div className={'departure-row-min ' + (this.props.departure.is_realtime ? 'departure-row-min-rt' : '')}>
					{(this.props.departure.leaves_in ?
						this.props.departure.leaves_in :
						HslApiUtils.getSymbol(this.props.departure.vehicle_type)
					)}
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
