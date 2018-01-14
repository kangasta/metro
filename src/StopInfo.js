import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './StopInfo.css';

class StopInfo extends Component {
	render() {
		return (
			<div className='stopinfo'>
				<div className='stopinfo-left'>
					<div
						className='stopinfo-left-symbol'
						onClick={this.props.leftSymbolOnClickCallback}
					>{this.props.leftSymbol}</div>
					<div className='stopinfo-left-text'>{this.props.leftText}</div>
				</div>
				<div className='stopinfo-right'>
					<div
						className='stopinfo-right-symbol'
						onClick={this.props.rightSymbolOnClickCallback}
					>{this.props.rightSymbol}</div>
					<div className='stopinfo-right-text'>{this.props.rightText}</div>
				</div>
				<div
					className='stopinfo-main-symbol'
					onClick={this.props.mainSymbolOnClickCallback}
				>{this.props.mainSymbol}</div>
				<div
					className='stopinfo-location'
					onClick={this.props.locationTextOnClickCallback}
				>{this.props.locationText}</div>
			</div>
		);
	}
}

StopInfo.defaultProps = {
	leftSymbol: '',
	leftText: '',
	rightSymbol: '',
	rightText: '',
	mainSymbol: '',
	locationText: '',
	leftSymbolOnClickCallback: ()=>undefined,
	rightSymbolOnClickCallback: ()=>undefined,
	mainSymbolOnClickCallback: ()=>undefined,
	locationTextOnClickCallback: ()=>undefined
};

StopInfo.propTypes = {
	leftSymbol: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
	leftText: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
	rightSymbol: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
	rightText: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
	mainSymbol: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
	locationText: PropTypes.string,
	leftSymbolOnClickCallback: PropTypes.func,
	rightSymbolOnClickCallback: PropTypes.func,
	mainSymbolOnClickCallback: PropTypes.func,
	locationTextOnClickCallback: PropTypes.func
};



export default StopInfo;
