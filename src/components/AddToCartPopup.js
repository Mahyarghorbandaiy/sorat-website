import React from 'react';
import { withRouter } from 'react-router';
import 'whatwg-fetch';
import VehicleSelection from './VehicleSelection';
import PopUpContainer from './subcomponents/PopUpContainer';
import PopUpContainerTires from './subcomponents/PopUpContainerTires';
import SizeSelectionTires from './SizeSelectionTires';
import Size from './Sizes';
import '../statics/stylesheet.css';

class AddToCartPopup extends React.Component {

  constructor(props) {
    super(props);
    const isTire = props.params.category === 'Tires';
    const vehicleSelected = props.params.search_by === 'Vehicle' && !isTire;
    this.state = {
      vehicleSelected,
      loading: vehicleSelected,
      step1Confirmed: !vehicleSelected && !isTire,
      step2Confirmed: false,
      step3Confirmed: false,
      step4Confirmed: false,
      tireCheckoutPage: isTire,
      compatible: null,
      hdata: [],
      newsize: '',
      category: window.localStorage.getItem('category')
    };
  }

  getOEMS(year, make, model) {

    const { category, search_by, options } = this.props.params;
    const vehicle = options.split('!');
    const modifiedModel = vehicle[2].split('/').join('|');

    fetch('https://www.soratwheels.ca/apii/tires.php/search/tires/vehicle/year/' + vehicle[0] + '/make/' + vehicle[1] + '/model/' + modifiedModel)
            .then(response => {
              return response.json();
            }).then((json) => {
              this.setState({ hdata: [...json] });
              window.localStorage.setItem('hdata', JSON.stringify(json.standard));
              window.localStorage.setItem('hdata2', JSON.stringify(json.staggered));
            });

    const wheels_size = window.localStorage.getItem('SIZE');
    window.localStorage.setItem('wheelsizeselected', wheels_size);
  }

  componentDidMount() {
    const isTire = this.props.params.category === 'Tires';
    const { vehicleSelected } = this.state;
    if (vehicleSelected || isTire) {
      this.handleConfirmVehicleClicked();
    }
  }

  checkTPMSEligibility(year) {
    if (year >= 2006) {
      this.setState({ step1Confirmed: false, step2Confirmed: false, step3Confirmed: true });
    } else {
      this.setState({ step1Confirmed: false, step2Confirmed: false, step4Confirmed: true });
    }
  }

    //Step 1: Confirm pressed
  async handleConfirmVehicleClicked() {
    const isTire = this.props.params.category === 'Tires';
    const sectionInvalidationStorage = JSON.parse(window.localStorage.getItem('mage-cache-storage-section-invalidation')) || {};
    sectionInvalidationStorage.cart = true;
    sectionInvalidationStorage.messages = true;
    window.localStorage.setItem('mage-cache-storage-section-invalidation', JSON.stringify(sectionInvalidationStorage));

    const year = window.localStorage.getItem('carYear');
    const make = window.localStorage.getItem('carMake');
    const model = window.localStorage.getItem('carModel');
    const isCompatible = false;

    this.setState({ loading: true });
    this.getOEMS(year, make, model);

    if (isTire) {
      this.setState({
        step1Confirmed: false,
        loading: false
      });

    } else {
      this.setState({
        step1Confirmed: false,
        step4Confirmed: true,
        loading: false
      });
    }
  }

  alertChangeVehicle() {
    this.setState({ step2Confirmed: false, step1Confirmed: true });
  }

  alertContinueWithVehicle() {
    if (window.product.product) {
      this.addProductToCart();
      this.addHardwareToCart();
    } else {
      this.addProductToCart('front');
      this.addProductToCart('back');
      this.addHardwareToCart();
    }
    this.checkTPMSEligibility(window.localStorage.getItem('carYear'));
  }

  addTPMSSensor(add) {
    if (add) {
      this.addTPMS();
    }
    this.setState({ step3Confirmed: false, step4Confirmed: true });
  }

  shopForTires(year, make, model) {

    this.getOEMS(year, make, model);

    window.localStorage.setItem('category', 'Tires');
    window.localStorage.setItem('searchcategory', 'Vehicle');

    if (window.localStorage.getItem('winter wheels') && window.localStorage.getItem('winter wheels') === 'false') {
      localStorage.setItem('performance tire', 'false');
    }

    this.setState({ step4Confirmed: false, step3Confirmed: true });
  }

  goCheckout() {
    this.setState({ step4Confirmed: false });
  }

  exitCart() {
    this.setState({ step4Confirmed: false });
  }

  addItemToForm = (form, name, value) => {
    name = encodeURIComponent(name.replace(/\.\[/g, '['));
    value = encodeURIComponent(value.toString());
    form.push(`${name}=${value}`);
  }

  addProductToCart = (frontOrBack) => {
    this.setState({ loading: true });
    const form_data = [];
    let action = window.product.action;

    if (window.product.product) {
      this.addItemToForm(form_data, 'product', window.product.product);
      this.addItemToForm(form_data, 'qty', window.product.qty);
    } else {
      this.addItemToForm(form_data, 'product', window.product[frontOrBack].product);
      this.addItemToForm(form_data, 'qty', window.product[frontOrBack].qty);
      action = window.product.action.replace(window.product.front.product, window.product[frontOrBack].product);
    }
    this.addItemToForm(form_data, 'form_key', window.product.form_key);
    this.addItemToForm(form_data, 'uenc', window.product.uenc);

  }

  addTPMS = () => {
    const productKey = 85480;
    this.addItemToCart(productKey);
  }

  addHardwareToCart = () => {
    const productKey = 85481;
    this.addItemToCart(productKey, 1);
    if (this.state.category === 'Winter Packages') {
      window.sessionStorage.setItem('winterPackageSelected', 'true');
    }
  }

  addbalanceToCart = () => {
    const productKey = 2590;
    this.addItemToCart(productKey, 1);
  }

  addItemToCart = (productKey, qty) => {
    this.setState({ loading: true });
    const form_data = [];
    let product, quantity;

    if (window.product.product) {
      product = window.product;
      quantity = product.qty;
    } else {
      product = window.product.front;
      quantity = (parseInt(window.product.front.qty) + parseInt(window.product.back.qty)).toString();
    }

    if (qty) {
      quantity = qty;
    }

    const action = window.product.action.replace(product.product, productKey);

    this.addItemToForm(form_data, 'product', productKey);
    this.addItemToForm(form_data, 'form_key', window.product.form_key);
    this.addItemToForm(form_data, 'qty', quantity);
    this.addItemToForm(form_data, 'uenc', window.product.uenc);
  }

  render() {
    const year = window.localStorage.getItem('carYear');
    const make = window.localStorage.getItem('carMake');
    const model = window.localStorage.getItem('carModel');
    const props = this.props;
    const { params } = this.props;
    const { step1Confirmed, step2Confirmed, step3Confirmed, step4Confirmed, tireCheckoutPage } = this.state;

    if (this.state.loading) {
      return (
                <div>
                    <div className="popUp-InformationDiv">
                        <div className="popUp-innerInformationDiv">
                            <h2 className="content-titleFont">Please wait ... </h2>
                            {navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ?
                                this.state.loading &&
                                <img src={window.host + '/statics/img/loading.svg'}/> :
                                this.state.loading &&
                                <img src={window.host + '/statics/img/loading.gif'}/>
                            }
                        </div>
                    </div>
                </div>);
    }

    if (step1Confirmed) {
      return (
                <div>
                    <div className="popUp-InformationDiv">
                        <VehicleSelection {...props} params={params} confirm
                          whenClicked={() => this.handleConfirmVehicleClicked()}/>
                    </div>
                </div>
      );
    }

    if (step2Confirmed) {
      return (
                <PopUpContainer
                    titleText={'Warning!'}
                    infoText={'The selected wheel is not compatible with your vehicle.'}
                    buttonOneText={'Continue'}
                    buttonTwoText={'Change vehicle'}
                    buttonOneFunction={this.alertContinueWithVehicle.bind(this)}
                    buttonTwoFunction={this.alertChangeVehicle.bind(this)}
                    isWarning/>
      );
    }
    if (step3Confirmed) {
      const props = this.props;
      const { params } = this.props;
      const { category, search_by } = params;

       return (
                <PopUpContainerTires params={params}/>
      );
    }

    if (step4Confirmed) {
      const yeartext = window.localStorage.getItem("carYear");
      const maketext = window.localStorage.getItem("carMake");
      const modeltext = window.localStorage.getItem("carModel");
      return (
                    <PopUpContainer
                        titleText={'Wheel & Tire Combo'}
                        infoText={`Would you like to make this a Wheel and Tire Combo? ${yeartext} ${maketext} ${modeltext}`}
                        buttonOneText={'Yes, Shop for tires'}
                        buttonTwoText={'No'}
                        buttonOneFunction={() => this.shopForTires(year, make, model)}
                        buttonTwoFunction={this.goCheckout.bind(this)}/>
      );
    }
    if (tireCheckoutPage) {
      return (
                <PopUpContainer
                    titleText={''}
                    infoText={'Would you like to add more items to your Cart?'}
                    buttonOneText={'Continue shopping'}
                    buttonTwoText={'View cart & checkout'}
                    buttonOneFunction={() => this.shopForTires(year, make, model)}
                    buttonTwoFunction={this.exitCart.bind(this)}/>
      );
    }
    return <div/>;
  }
}

AddToCartPopup.propTypes = {
  children: React.PropTypes.element,
  params: React.PropTypes.object.isRequired
};

AddToCartPopup.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default withRouter(AddToCartPopup);
