import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCart, removeProduct, changeProductQuantity } from '../Actions/CartActions';
import { updateCart } from '../total/actions';
import CartProduct from './cartProduct';
import { formatPrice } from '../util';
import './style.css';

class FloatCart extends Component {
  static propTypes = {
    loadCart: PropTypes.func.isRequired,
    updateCart: PropTypes.func.isRequired,
    cartProducts: PropTypes.array.isRequired,
    newProduct: PropTypes.object,
    removeProduct: PropTypes.func,
    productToRemove: PropTypes.object,
    changeProductQuantity: PropTypes.func,
    productToChange: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      emailform: false,
      showSuccessModal: false,
      showValidationModal: false,
      validationErrors: [],
      estimateId: null,
      pdfUrl: null,
      isProcessing: false,
      // Vehicle selection fields
      vehicles: null,
      selectedCarYear: '',
      selectedCarMake: '',
      selectedCarModel: '',
      availableMakes: []
    };
  }

  componentDidMount() {
    this.loadVehiclesFromStorage();
  }

  loadVehiclesFromStorage = () => {
    const vehicles = localStorage.getItem('vehicles');
    if (vehicles) {
      try {
        this.setState({ vehicles: JSON.parse(vehicles) });
      } catch (error) {
        console.error('Error parsing vehicles data:', error);
      }
    }
  }

  handleCarYearChange = (e) => {
    const year = e.target.value;
    const makes = this.state.vehicles && this.state.vehicles[year] ? Object.keys(this.state.vehicles[year]) : [];
    
    this.setState({
      selectedCarYear: year,
      selectedCarMake: '',
      selectedCarModel: '',
      availableMakes: makes
    });
  }

  handleCarMakeChange = (e) => {
    const make = e.target.value;
    this.setState({
      selectedCarMake: make,
      selectedCarModel: ''
    });
  }

  handleCarModelChange = (e) => {
    this.setState({
      selectedCarModel: e.target.value
    });
  }

  closeValidationModal = () => {
    this.setState({ showValidationModal: false, validationErrors: [] });
  };

  closeSuccessModal = () => {
    this.setState({ showSuccessModal: false, estimateId: null, pdfUrl: null });
  };

  downloadPDF = () => {
    if (this.state.pdfUrl) {
      window.open(this.state.pdfUrl, '_blank');
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.newProduct !== this.props.newProduct) {
      this.addProduct(nextProps.newProduct);
    }

    if (nextProps.productToRemove !== this.props.productToRemove) {
      this.removeProduct(nextProps.productToRemove);
    }

    if (nextProps.productToChange !== this.props.productToChange) {
      this.changeProductQuantity(nextProps.productToChange);
    }
  }

  openFloatCart = () => {
    this.setState({ isOpen: true });
    let overlay = null;
    overlay = document.createElement('div');
    overlay.className = 'addcart-overlay';
    document.querySelector('.main__content_wrapper').append(overlay);
    document.querySelector('.addcart-overlay').addEventListener('click', (e) => {
      this.closeFloatCart();
    });
  };

  closeFloatCart = () => {
    this.setState({ isOpen: false });
    if (document.querySelector('.addcart-overlay')) {
      document.querySelector('.addcart-overlay').remove();
    }
  };

  showform = () => {
    if ( this.state.emailform == false) {
      this.setState({ emailform: true });
      const ahghari = document.getElementsByClassName('float-cart__footer');
      const ahghari2 = document.getElementsByClassName('float-cart__content');
      for (var i = 0; i < ahghari.length; i++) {
        ahghari[i].style.height = '555px';
        ahghari2[i].style.height = '65%';
      }
    } else {
      this.setState({ emailform: false });
      const ahghari = document.getElementsByClassName('float-cart__footer');
      const ahghari2 = document.getElementsByClassName('float-cart__content');
      for (var i = 0; i < ahghari.length; i++) {
        ahghari[i].style.height = '355px';
        ahghari2[i].style.height = '65%';
      }
    }
  };

  ClearCart = () => {
    const { cartTotal, cartProducts, removeProduct, changeProductQuantity } = this.props;

    const hooman = cartProducts.length;

    for (let i = 0; i < hooman; i++ ) {
      this.removeProduct(cartProducts[0]);
    }
  };

  // Phone validation function
  validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for valid Canadian/US phone patterns
    // 10 digits: 6041234567
    // 11 digits with 1: 16041234567
    if (cleanPhone.length === 10) {
      return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleanPhone);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return /^1[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleanPhone);
    }
    return false;
  }

  // Email validation function
  validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  addProduct = product => {
    const { cartProducts, updateCart } = this.props;
    let productAlreadyInCart = false;

    cartProducts.forEach(cp => {

      if (Number(cp.entity_id) === Number(product.entity_id)) {
        cp.quantity += product.quantity;
        productAlreadyInCart = true;
      }
    });

    let hoomiz = [];
    if (JSON.parse(localStorage.getItem('tireback'))) {
      hoomiz = JSON.parse(localStorage.getItem('tireback'));
      cartProducts.push(hoomiz);
      localStorage.removeItem('tireback');
    }
    if (JSON.parse(localStorage.getItem('wheelsback'))) {
      hoomiz = JSON.parse(localStorage.getItem('wheelsback'));
      cartProducts.push(hoomiz);
      localStorage.removeItem('wheelsback');
    }

    if (JSON.parse(localStorage.getItem('tpms'))) {
      hoomiz = JSON.parse(localStorage.getItem('tpms'));
      let tpmsq = false;
      cartProducts.forEach(homi => {

        if (homi.sku === hoomiz.sku) {
          homi.quantity += product.quantity;
          tpmsq = true;
        }
      });
      if (!tpmsq) {
        cartProducts.push(hoomiz);
      }
      localStorage.removeItem('tpms');
    }

    if (!productAlreadyInCart) {
      cartProducts.push(product);
    }

    updateCart(cartProducts);
    if (window.innerWidth > 768 ) {
      this.openFloatCart();
    }
  };

  removeProduct = product => {
    const { cartProducts, updateCart } = this.props;
    const index = cartProducts.findIndex(p => p.entity_id === product.entity_id);
    if (index >= 0) {
      cartProducts.splice(index, 1);
      updateCart(cartProducts);
    }
  };

  changeProductQuantity = changedProduct => {
    const { cartProducts, updateCart } = this.props;
    const product = cartProducts.find(p => p.entity_id === changedProduct.entity_id);
    product.quantity = changedProduct.quantity;
    if (product.quantity <= 0) {
      this.removeProduct(product);
    }
    updateCart(cartProducts);
  }

  pdf = async (products, sendEmail = false) => {
    console.log("test pdf website", products);
    
    this.setState({ isProcessing: true });
    
    // Get customer info from form
    const form = document.getElementById('hooman');
    if (!form) {
      alert('Please fill out the customer information first');
      this.setState({ isProcessing: false });
      return;
    }
    
    const formData = new FormData(form);
    const customerInfo = {
      name: formData.get('user_name'),
      last_name: formData.get('user_last_name'),
      phone: formData.get('user_phone').replace(/\D/g, ''), // Remove all non-digit characters
      email: formData.get('user_email'),
      car: this.state.selectedCarYear && this.state.selectedCarMake && this.state.selectedCarModel ? 
           this.state.selectedCarYear + ' ' + this.state.selectedCarMake + ' ' + this.state.selectedCarModel : 
           ''
    };

    // Validate required fields
    const errors = [];
    if (!customerInfo.name) errors.push('First Name');
    if (!customerInfo.last_name) errors.push('Last Name');
    if (!customerInfo.phone) {
      errors.push('Phone Number');
    } else if (!this.validatePhone(customerInfo.phone)) {
      errors.push('Valid Phone Format (e.g., 6041234567)');
    }
    if (!customerInfo.email) {
      errors.push('Email');
    } else if (!this.validateEmail(customerInfo.email)) {
      errors.push('Valid Email Format');
    }

    if (errors.length > 0) {
      this.setState({ 
        showValidationModal: true,
        validationErrors: errors,
        isProcessing: false
      });
      
      // Make empty/invalid fields red
      errors.forEach(field => {
        let fieldName = '';
        if (field === 'First Name') fieldName = 'user_name';
        if (field === 'Last Name') fieldName = 'user_last_name';
        if (field === 'Phone Number' || field.includes('Valid Phone Format')) fieldName = 'user_phone';
        if (field === 'Email' || field === 'Valid Email Format') fieldName = 'user_email';
        
        const input = document.querySelector(`input[name="${fieldName}"]`);
        if (input) {
          input.style.borderColor = '#e74c3c';
          input.style.backgroundColor = '#fdf2f2';
        }
      });
      
      return;
    }

    // Reset field colors if validation passes
    ['user_name', 'user_last_name', 'user_phone', 'user_email'].forEach(fieldName => {
      const input = document.querySelector(`input[name="${fieldName}"]`);
      if (input) {
        input.style.borderColor = '#ccc';
        input.style.backgroundColor = 'white';
      }
    });

    // Convert cart products to services format
    const { cartProducts, cartTotal } = this.props;
    const services = [];
    
    cartProducts.forEach((product, index) => {
      services.push({
        id: Date.now() + index,
        type: product.type === 'Tires' ? 'Tire' : product.type === 'Wheels' ? 'Wheel' : 'Other',
        service: product.sku,
        description: product.name,
        qty: product.quantity,
        rate: product.type === 'Wheels' && product.promo && product.promo[0] > 0 ? 
              parseFloat(product.promo[0]) : 
              parseFloat(product.price[0]),
        total: (product.type === 'Wheels' && product.promo && product.promo[0] > 0 ? 
               parseFloat(product.promo[0]) : 
               parseFloat(product.price[0])) * product.quantity,
        tax: 12, // GST + PST
        image: product.image || product.w_image || product.t_image || null
      });
    });

    // Add installation if applicable
    const quantityWheels = JSON.parse(localStorage.getItem('qwheels'));
    const quantityTires = JSON.parse(localStorage.getItem('qtires'));

    if (quantityWheels > 0 && quantityTires === 0) {
      services.push({
        id: Date.now() + 1000,
        type: 'Other',
        service: 'Installation',
        description: 'Installation & Balancing',
        qty: 1,
        rate: 100,
        total: 100,
        tax: 12
      });
    }

    // Add ADF if applicable
    if (quantityTires > 0) {
      const adfTotal = quantityTires * 6.50;
      services.push({
        id: Date.now() + 2000,
        type: 'Other',
        service: 'BC Tire Levy',
        description: 'Advance Disposal Fee - BC Tire Levy',
        qty: quantityTires,
        rate: 6.50,
        total: adfTotal,
        tax: 5
      });
    }

    // Calculate total
    const subtotal = cartTotal.totalPrice;
    const installation = quantityWheels > 0 && quantityTires === 0 ? 100 : 0;

    const trf = quantityTires * 6.50;
    const gstsum = subtotal - (subtotal - cartTotal.totalDiscount) + installation;
    const gst = 5 * gstsum / 100;
    const pst = 7 * gstsum / 100;
    const total = Math.round((gstsum + gst + pst + trf) * 100) / 100;

    const payload = {
      customer: customerInfo,
      services: services,
      total: total
    };

    try {
      // Send to add_estimate_website.php
      const response = await fetch('https://soratwheels.com/apii/add_estimate_website.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.ok || result.success) {
        // Store PDF info in localStorage
        localStorage.setItem('estimate_id', result.idestimate || result.estimate_id);
        localStorage.setItem('pdf_url', result.pdf_url);
        
        // Reset form fields BEFORE showing modal
        form.reset();
        
        // Reset field colors to default
        ['user_name', 'user_last_name', 'user_phone', 'user_email', 'user_car'].forEach(fieldName => {
          const input = document.querySelector(`input[name="${fieldName}"]`);
          if (input) {
            input.style.borderColor = '#ccc';
            input.style.backgroundColor = 'white';
          }
        });
        
        // Show success modal AFTER resetting fields
        this.setState({
          showSuccessModal: true,
          estimateId: result.idestimate || result.estimate_id,
          pdfUrl: result.pdf_url,
          isProcessing: false
        });

        // Send email only if requested
        if (sendEmail) {
          await fetch('https://soratwheels.com/apii/email_estimate.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: customerInfo.email,
              name: customerInfo.name,
              last_name: customerInfo.last_name,
              phone: customerInfo.phone,
              estimate_id: result.idestimate || result.estimate_id,
              pdf_url: result.pdf_url
            })
          });
        }
      } else {
        throw new Error(result.message || 'Failed to save estimate');
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert('Error saving estimate. Please try again.');
      this.setState({ isProcessing: false });
    }
  }

  render() {
    const { cartTotal, cartProducts, removeProduct, changeProductQuantity } = this.props;

    let qwheels = 0;
    let qtires = 0;
    cartProducts.forEach(ww => {

      if (ww.type === 'Wheels') {
        qwheels += ww.quantity;
      } else if (ww.type === 'Tires') {
        qtires += ww.quantity;
      } else if (ww.name.includes('Winter Package')) {
        qtires += 4 * ww.quantity;
        qwheels += 4 * ww.quantity;
      }
    });

    localStorage.setItem('qwheels', JSON.stringify(qwheels));
    localStorage.setItem('qtires', JSON.stringify(qtires));

    const products = cartProducts.map(p => {
      return (
        <CartProduct product={p} removeProduct={removeProduct} changeProductQuantity={changeProductQuantity} key={p.entity_id} />
      );
    });

    const classes = ['float-cart'];

    if (this.state.isOpen) {
      classes.push('float-cart--open');
    }

    const quantityWheels = JSON.parse(localStorage.getItem('qwheels'));
    const quantityTires = JSON.parse(localStorage.getItem('qtires'));
    let installation = 0;
    let trf = 0;

    if (quantityWheels > 0 && quantityTires === 0) {
      installation = 100;
    }

    if (quantityTires > 0) {
      trf = quantityTires * 6.50;
    }

    const subtotal = cartTotal.totalPrice;
    const subdiscount = subtotal - cartTotal.totalDiscount;
    const gstsum = subtotal - subdiscount + installation + trf;
    const pstsum = subtotal - subdiscount + installation;
    const gst = 5 * gstsum / 100;
    const pst = 7 * pstsum / 100;
    const ordertotall = gstsum + gst + pst;

    return (

      <div className={classes.join(' ')}>

        {this.state.isOpen &&
          <div
            onClick={() => this.closeFloatCart()}
            className="float-cart__close-btn"
          >
            X
          </div>
        }

        {/* If cart is closed, show bag with quantity of product and open cart action */}
        {!this.state.isOpen &&
         <span
            onClick={() => this.openFloatCart()}
            className="bag bag--float-cart-closed"
          >
            <span className="bag__quantity">{cartTotal.productQuantity}</span>
          </span>
        }

        <div className="float-cart__content" >

          <div className="float-cart__header" style={{
            background: 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
            color: 'white',
            boxSizing: 'border-box',
            textAlign: 'center',
            padding: '20px 0',
            boxShadow: '0 2px 10px rgba(197, 0, 0, 0.2)'
          }}>
            <span className="bag">
              <span className="bag__quantity" style={{
                backgroundColor: '#ffd700',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '0.75em'
              }}>{cartTotal.productQuantity}</span>
            </span>
            <span className="header-title" style={{
              fontWeight: '700',
              fontSize: '1.3em',
              verticalAlign: 'middle',
              letterSpacing: '0.5px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>Shopping Cart</span>
          </div>

          <div className="float-cart__shelf-container">
            {products}
            {!products.length &&
              <p className="shelf-empty">
                You have no items in your shopping cart. <br />
              </p>
            }
          </div>

          <div className="float-cart__footer">

            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '2px 12px', 
              borderRadius: '8px', 
              marginBottom: '6px',
              border: '1px solid #e9ecef'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>Order:</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#212529' }}>
                  {`CA$ ${formatPrice(cartTotal.totalPrice)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#C50000', fontWeight: '500' }}>Discount:</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#C50000' }}>
                  {`CA$ ${formatPrice(subdiscount)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>Installation & Balancing:</span>
                {installation === 100 ? (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#212529' }}>
                    {`CA$ ${formatPrice(installation)}`}
                  </span>
                ) : (
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#28a745',
                    backgroundColor: '#d4edda',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    border: '1px solid #c3e6cb'
                  }}>
                    FREE
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>ADF (Advance Disposal Fee):</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#212529' }}>
                  {`CA$ ${formatPrice(trf)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>GST (5%):</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#212529' }}>
                  {`CA$ ${formatPrice(gst)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: '500' }}>PST (7%):</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#212529' }}>
                  {`CA$ ${formatPrice(pst)}`}
                </span>
              </div>

              <hr style={{ 
                margin: '8px 0', 
                border: 'none', 
                borderTop: '2px solid #C50000',
                opacity: 0.8
              }} />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '5px 10px',
                borderRadius: '6px',
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#C50000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  TOTAL:
                </span>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#C50000'
                }}>
                  {`CA$ ${formatPrice(ordertotall)}`}
                </span>
              </div>
            </div>

            <div>
                { products.length > 0 &&
                  <button 
                    className="modern-btn primary-btn" 
                    onClick={() => this.showform()} 
                    style={{ 
                      background: 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(197, 0, 0, 0.3)',
                      marginRight: '10px',
                      minWidth: '120px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }} 
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(197, 0, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(197, 0, 0, 0.3)';
                    }}
                  >
                    Email Estimate
                    <span style={{ fontSize: '12px', transition: 'transform 0.3s ease', marginLeft: '7px' }}>
                      {this.state.emailform ? '▲' : '▼'}
                    </span>
                  </button>
                }

                { products.length > 0 &&
                  <button 
                    className="modern-btn danger-btn" 
                    onClick={() => this.ClearCart()} 
                    style={{ 
                      background: 'linear-gradient(135deg, #636363fa 0%, #473d3de7 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '120px'
                    }}
                  >
                    Clear Cart
                  </button>
                }

              {products.length > 0 && this.state.emailform == true &&

                <form id="hooman" onSubmit={(e) => {
                  e.preventDefault();
                  console.log("test pdf website", products);
                  console.log("test pdf website", e.target);
                  this.pdf({ /* products data */ }, true);
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                          <input 
                            type="text" 
                            name="user_name" 
                            placeholder="First Name *"
                            required 
                            style={{ 
                              flex: 1,
                              padding: '6px 8px', 
                              border: '1px solid #ccc', 
                              borderRadius: '4px',
                              fontSize: '14px !important',
                              minWidth: 0
                            }} 
                          />
                          <input 
                            type="text" 
                            name="user_last_name" 
                            placeholder="Last Name *"
                            required 
                            style={{ 
                              flex: 1,
                              padding: '6px 8px', 
                              border: '1px solid #ccc', 
                              borderRadius: '4px',
                              fontSize: '14px !important',
                              minWidth: 0
                            }} 
                          />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="tel" 
                      name="user_phone" 
                      placeholder="Phone* (e.g., 6041234567)"
                      required 
                      style={{ 
                      flex: 1,
                          padding: '6px 8px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px',
                          fontSize: '14px !important',
                          minWidth: 0
                      }} 
                    />
                     <input 
                      type="email" 
                      name="user_email" 
                      placeholder="Email *"
                      required 
                      style={{ 
                          flex: 1,
                          padding: '6px 8px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px',
                          fontSize: '14px !important',
                          minWidth: 0
                      }} 
                    />
                    </div>

                    {/* Vehicle Selection - Replace the single car input */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <select 
                        value={this.state.selectedCarYear} 
                        onChange={this.handleCarYearChange}
                        style={{ 
                          flex: 1,
                          padding: '6px 8px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minWidth: 0
                        }}
                      >
                        <option value="">Year</option>
                        {this.state.vehicles && Object.keys(this.state.vehicles).reverse().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      
                      <select 
                        value={this.state.selectedCarMake} 
                        onChange={this.handleCarMakeChange}
                        disabled={!this.state.selectedCarYear}
                        style={{ 
                          flex: 1,
                          padding: '6px 8px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          opacity: !this.state.selectedCarYear ? 0.5 : 1,
                          minWidth: 0
                        }}
                      >
                        <option value="">Make</option>
                        {this.state.availableMakes.map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </select>
                      
                      <input 
                        type="text" 
                        placeholder="Model" 
                        value={this.state.selectedCarModel} 
                        onChange={this.handleCarModelChange}
                        disabled={!this.state.selectedCarMake}
                        style={{ 
                          flex: 1,
                          padding: '6px 8px', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          opacity: !this.state.selectedCarMake ? 0.5 : 1,
                          minWidth: 0
                        }}
                      />
                    </div>

                  </div>

                  <input 
                    type="submit" 
                    style={{ 
                      background: this.state.isProcessing ? '#ccc' : 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 30px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: this.state.isProcessing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(197, 0, 0, 0.3)',
                      minWidth: '160px'
                    }} 
                    value={this.state.isProcessing ? "Processing..." : "Save & Inquire"}
                    disabled={this.state.isProcessing}
                  />
                </form>
              }
            </div>
          </div>
        </div>

        {/* Validation Error Modal */}
        {this.state.showValidationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#c91d1dff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>!</div>
                <h3 style={{ margin: 0, color: '#a01616ff', fontSize: '16px' }}>
                  Required Fields Missing
                </h3>
              </div>
              
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#3d3d3dff' }}>
                Please fill out the following required fields:
              </p>
              
              <ul style={{ 
                margin: '0 0 20px 0', 
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#333'
              }}>
                {this.state.validationErrors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{error}</li>
                ))}
              </ul>
              
              <button
                onClick={this.closeValidationModal}
                style={{
                  backgroundColor: '#e71717ff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {this.state.showSuccessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 style={{ 
                color: '#28a745', 
                marginBottom: '15px',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                Estimate Created Successfully!
              </h3>
              
              <p style={{ 
                color: '#666', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                Your estimate <strong>{this.state.estimateId}</strong> has been saved successfully!
                <br /><br />
                📧 An email with your estimate has been sent.
                <br />
                <strong style={{ color: '#C50000' }}>
                  Please check your spam/junk folder if you don't see it in your inbox.
                </strong>
              </p>
              
              <div style={{ marginBottom: '25px' }}>
                <button
                  onClick={this.downloadPDF}
                  style={{
                    background: 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 25px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginRight: '10px',
                    boxShadow: '0 4px 15px rgba(197, 0, 0, 0.3)'
                  }}
                >
                Download PDF
                </button>
                
                <button
                  onClick={this.closeSuccessModal}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px 25px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  productToChange: state.cart.productToChange,
  cartTotal: state.total.data
});

export default connect(
  mapStateToProps,
  { loadCart, updateCart, removeProduct, changeProductQuantity }
)(FloatCart);
