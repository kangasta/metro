import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './DepartureRow.css';

class DepartureRow extends Component {
	render() {
		return (
			<div
				className={
					'departure-row' +
					' ' + ((this.props.departure.leaves_in <= 2) ? 'effect-blink' : '') +
					' ' + (this.props.departure.hasOwnProperty('coords') ? 'effect-link' : '')}
				onClick={this.props.onClickCallback}
			>
				<div className={'departure-row-min ' + (this.props.departure.is_realtime ? 'departure-row-min-rt' : '')}>
					{this.props.departure.leaves_in}
				</div>
				<div className='departure-row-route'>
					{this.props.departure.route}
				</div>
				<div className='departure-row-dest'>
					{this.props.departure.destination}
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
