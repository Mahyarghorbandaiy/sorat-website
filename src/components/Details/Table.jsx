import React from 'react';
import './table.css';
export default class Table extends React.PureComponent {
	constructor(props) {
		super(props);
		const { data } = this.props;
		this.state = {
			productInfos: [
				{
					Shipping_For_Product: data.children[0] ? data.children[0].Shipping : '0.00',
					Enable_Shipping_Per_Product: 'yes',
					center_bore: data.children[0] ? data.children[0].center_bore : '',
					Model: data ? data.model : '',
					Manufacturer_Part_Number: data ? data.name : '',
					Wheel_Manufacturer: data ? data.wheel_manufacturer : '',
					bolt_pattern_1: data.children[0] ? data.children[0].bolt_pattern_1 : '',
					Wheel_Size: data.children[0] ? data.children[0].wheel_size : '',
					Wheel_Width_in_inches: data.children[0] ? data.children[0].wheel_width : '0',
					Wheel_Finish: data.children[0] ? data.children[0].wheel_finish : ''
				}
			]
		};
	}

	renderTableHeader() {
		const header = Object.keys(this.state.productInfos[0]);
		
		 return header.map((key, index) => {
			return (
			<th key={index}>{key}</th>
			);
		});
	}

	renderTableData() {
		return this.state.productInfos.map((productInfo, index) => {
			const {
				Shipping_For_Product,
				Enable_Shipping_Per_Product,
				center_bore,
				Model,
				Manufacturer_Part_Number,
				Wheel_Manufacturer,
				bolt_pattern_1,
				Wheel_Size,
				Wheel_Width_in_inches,
				Wheel_Finish
			} = productInfo;
			return (
				<tr key={Math.floor(Math.random() * 10000 + 1)}>
					<td>{Shipping_For_Product}</td>
					<td>{Enable_Shipping_Per_Product}</td>
					<td>{center_bore}</td>
					<td>{Model}</td>
					<td>{Manufacturer_Part_Number}</td>
					<td>{Wheel_Manufacturer}</td>
					<td>{bolt_pattern_1}</td>
					<td>{Wheel_Size}</td>
					<td>{Wheel_Width_in_inches}</td>
					<td>{Wheel_Finish}</td>
				</tr>
			);
		});
	}

	render() {
		return (
			<div>
				<table id="ProductInfo">
					<tbody>
						<tr>{this.renderTableHeader()}</tr>
						{this.renderTableData()}
					</tbody>
				</table>
			</div>
		);
	}
}
