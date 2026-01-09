import React from 'react';
import './detail.css';
import PropTypes from 'prop-types';
import Tooltip from 'material-ui/Tooltip';
import { withRouter } from 'react-router';

class ProductDetails extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: 0,
			warehouse: 37,
			quantity: 0
		};
		this.mainStyles = {
			main: {
				display: 'flex',
				flexDirection: 'row-reverse'
			},
			container: {
				display: 'flex',
				flexDirection: 'column',
				background: '#fff',
				boxSizing: 'border-box',
				marginLeft: 'auto',
				marginRight: 'auto',
				maxWidth: 1280,
				paddingLeft: 20,
				paddingRight: 20
			},
			gallery: {
				height: 500,
				width: 500
			},
			productMedia: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 10,
				margin: '0 auto'
			},
			productInfoMain: {
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column'
			},
			topBarInfo: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-start'
			},
			topBarPrice: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between'
			},
			bottomBarInfo: {
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column'
			},
			bottomBarQty: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center'
			},
			pricingActions: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between'
			},
			tabTitle: {
				borderRadius: 0
			}
		
		};
	}
	getOptionsListFor(options) {
		const getOptions = (option) => (
			<MenuItem key={option} value={option}>
				{option}
			</MenuItem>
		);
		return R.map(getOptions)(options);
	}

	handleSubmit(e) {
		e.preventDefault();
		console.log(this.state);
	}

	handleChange(e) {
		this.setState({
			quantity: e.target.value
		});
	}

	render() {
		const { data, addToCart } = this.props;
		return (

			<div className="product-info-container" style={this.mainStyles.container}>
				<div className="main" style={this.mainStyles.main}>
					<div className="product-info-main" style={this.mainStyles.productInfoMain}>
						<div className="top-bar" style={this.mainStyles.topBarInfo}>
							<span className="top-bar-title">{data.name}</span>
						</div>
						
						<div className="bottom-bar" style={this.mainStyles.bottomBarInfo}>
					
							<form onSubmit={this.handleSubmit.bind(this)}>
							<div className="top-bar-price" style={this.mainStyles.topBarPrice}>
														
								<span>SKU#: {data.sku}</span>
							</div>
							<span>Center bore: {data.children[0].center_bore}</span>
							<span>Center bore: {data.children[0].wheel_size}</span>
							<div>

							<span className="price">{`CA$${data.children[0].price.substring(
									0,
									data.children[1].price.length - 2
								)}`}</span>

							</div>
							<br/>
                                 
								<div className="bottom-bar-qty" style={this.mainStyles.bottomBarQty}>
									<span>Qty</span>
									<input
										type="text"
										value='4'
										onChange={this.handleChange.bind(this)}
									/>
								</div>
								<div className="bottom-bar-shipping">
								<span>Ships Free in 1-3 days</span>
								<Tooltip
									title={'statice Warehouse:' + this.state.warehouse}
									placement="bottom-start"
									style={{ fontSize: 14 }}
								>
									<button className="shipping-info">?</button>
								</Tooltip>
							</div>
								<div className="bottom-bar-button">
									<button className="addToCartBtn" onClick={addToCart}>
										Add to Cart
									</button>
								</div>					
							</form>
						</div>
					</div>
					<div className="product-media" style={this.mainStyles.productMedia}>
                    {data.image === 'no_selection' || data.image === '' ? <img src={window.baseUrl + '/pub/media/catalog/product/placeholder/default/soratimg.jpg'}
                                 className="image-slider__productItem__productImage"/> : <img src={window.baseUrl + '/pub/media/catalog/product' + data.image}
									 width="500"
						             height="500"
                                     />} 
					</div>
				</div>
				
			</div>
		);
	}
}

ProductDetails.propTypes = {
	data: PropTypes.object
};

export default withRouter(ProductDetails);
