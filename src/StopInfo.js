import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './StopInfo.css';

class StopInfo extends Component {
	constructor(props) {
		super(props);
		this.setHelpers(props);
	}

	componentWillReceiveProps(newProps) {
		this.setHelpers(newProps);
	}

	setHelpers(props) {
		this.callbacks = {
			left: props.leftSymbolOnClickCallback,
			right: props.rightSymbolOnClickCallback,
			main: props.mainSymbolOnClickCallback,
			location: props.locationTextOnClickCallback
		};

		this.symbols = {
			left: props.leftSymbol,
			right: props.rightSymbol,
			main: props.mainSymbol
		};

		this.texts = {
			left: props.leftText,
			right: props.rightText,
			location: props.locationText
		};
	}

	getSideElement(side) {
		if (['left','right'].indexOf(side) < 0) return undefined;

		return (
			<div key={side} className={'stopinfo-' + side}>
				<div
					className={'stopinfo-' + side + '-symbol'}
					onClick={this.callbacks[side]}
				>{this.symbols[side]}</div>
				<div className={'stopinfo-' + side + '-text'}>{this.texts[side]}</div>
			</div>
		);
	}

	render() {
		return (
			<div className='stopinfo'>
				{['left','right'].map((side)=>this.getSideElement(side))}
				<div
					className='stopinfo-main-symbol'
					onClick={this.callbacks.main}
				>{this.symbols.main}</div>
				<div
					className='stopinfo-location'
					onClick={this.callbacks.location}
				>{this.texts.location}</div>
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
