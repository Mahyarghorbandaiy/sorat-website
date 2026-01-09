import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Thumb from '../Thumb/index';
import { formatPrice } from '../../util';
import {
  DialogContent,
  DialogTitle,
  Dialog
} from 'material-ui';

class CartProduct extends Component {
  static propTypes = {
    product: PropTypes.object.isRequired,
    removeProduct: PropTypes.func.isRequired,
    changeProductQuantity: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      product: this.props.product,
      isMouseOver: false,
      showImage: false, 
      imageUrl: '' 
    };
  }

  handleMouseOver = () => {
    this.setState({ isMouseOver: true });
  };

  handleMouseOut = () => {
    this.setState({ isMouseOver: false });
  };

  handleOnIncrease = () => {
    const { changeProductQuantity } = this.props;
    const { product } = this.state;
    product.quantity += 1;
    changeProductQuantity(product);
  }

  handleOnDecrease = () => {
    const { changeProductQuantity } = this.props;
    const { product } = this.state;
    product.quantity -= 1;
    changeProductQuantity(product);
  }

  handleOpenimage(e, image) {
    if (image == 'no_selection' || image == 'https://panel.sorat.ca/apii/wpimage/winter-package.jpg') {
      this.setState({ showImage: false, imageUrl: '' });
    } else {
      this.setState({ showImage: true, imageUrl: image });
    }
  }

  handleCloseDialogImage() {
    this.setState({ showImage: false, imageUrl: '' });
  }

  render() {

    const { removeProduct } = this.props;
    const { product } = this.state;
    const classes = ['shelf-item'];

    if (this.state.isMouseOver) {
      classes.push('shelf-item--mouseover');
    }

    if (product.promo == 0 || !product.promo || product.promo[0] == 0 )  {
      if (product.type == 'Winter Package') {
        if ( product.tpms == '3' || product.tpms == '4' ) {
          return (
            <div className={classes.join(' ')}>

                             <Dialog open={this.state.showImage} onClose={(e) => this.handleCloseDialogImage(e)}
                          aria-labelledby="form-dialog-title" style={{ zIndex: '99999999999999999' }}>
                          <DialogTitle id="dialog-popup-inventiry-title" >
                          <a className="closebtnmain" onClick={(e) => this.handleCloseDialogImage(e)}>&times;</a>
                          </DialogTitle>
                          <DialogContent id="dialog-popup-inventiry-body" style={{ width: '550px', height: 'auto', overflow: 'hidden'  }}>
                              <img src={this.state.imageUrl} className='image' style={{ width: '550px', height: 'auto' }}/>
                          </DialogContent>
                        </Dialog>
            <div
                className="shelf-item__del"
                onMouseOver={() => this.handleMouseOver()}
                onMouseOut={() => this.handleMouseOut()}
                onClick={() => removeProduct(product)}
              />
               <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
              <Thumb
                classes="shelf-item__thumb"
                src={ product.w_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.w_image.includes('panel.sorat.ca') ? product.w_image : product.w_image.includes('wheelpros') ? product.w_image : product.w_image.includes('directautoimport') ? product.w_image : product.w_image.includes('https://wheel') ? product.w_image : window.baseUrl + '/media/' + product.w_image}
                alt={product.w_title}
              />
               </a>

              <div className="shelf-item__details">
                <p className="title">{product.w_title}</p>
                <p className="desc" style={{ fontSize: '12' }}>
                  Wheels Front SKU: {product.w_sku}
                </p>
                <p className="desc">
                  Quantity: 2
                </p>
                <p className="desc" />
              </div>

                   <div className="shelf-item__price">
                      <div />
                    </div>

                <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
                <Thumb
                classes="shelf-item__thumb"
                src={ product.w_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.w_image.includes('panel.sorat.ca') ? product.w_image : product.w_image.includes('wheelpros') ? product.w_image : product.w_image.includes('directautoimport') ? product.w_image : product.w_image.includes('https://wheel') ? product.w_image : window.baseUrl + '/media/' + product.w_image}
                alt={product.w_title}
              />
              </a>

              <div className="shelf-item__details">
                <p className="desc" style={{ fontSize: '12' }}>
                  Wheels Rear SKU: {product.w_profile}
                </p>
                <p className="desc">
                  Quantity: 2
                </p>
                <p className="desc" />
              </div>

                   <div className="shelf-item__price">
                      <div />
                    </div>
              <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
              <Thumb
                classes="shelf-item__thumb"
                src={ product.t_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.t_image.includes('panel.sorat.ca') ? product.t_image : product.t_image.includes('wheelpros') ? product.t_image : product.t_image.includes('directautoimport') ? product.t_image : product.t_image.includes('https://wheel') ? product.t_image : window.baseUrl + '/media/' + product.t_image}
                alt={product.w_title}
              /></a>

              <div className="shelf-item__details">
                <p className="title">{product.t_title}</p>
                <p className="desc" style={{ fontSize: '12' }}>
                  Tires Front SKU: {product.t_sku}
                </p>
                <p className="desc">
                  Quantity: 2
                </p>
                <p className="desc" />
              </div>
                   <div className="shelf-item__price">
                      <div />
                    </div>

                    <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>

                    <Thumb
                classes="shelf-item__thumb"
                src={ product.t_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.t_image.includes('panel.sorat.ca') ? product.t_image : product.t_image.includes('wheelpros') ? product.t_image : product.t_image.includes('directautoimport') ? product.t_image : product.t_image.includes('https://wheel') ? product.t_image : window.baseUrl + '/media/' + product.t_image}
                alt={product.w_title}
                    /></a>

              <div className="shelf-item__details">
                <p className="desc" style={{ fontSize: '12' }}>
                  Tires Rear SKU: {product.t_width}
                </p>
                <p className="desc">
                  Quantity: 2
                </p>
                <p className="desc" />
              </div>
                   <div className="shelf-item__price">
                    <div />
                    </div>

                 { product.tpms === '3' && <div>
                  <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
                   <Thumb
                classes="shelf-item__thumb"
                src={ window.baseUrl + '/media/tpms-service-schrader-tpms-sensor-sb-20720-1_grande.jpeg'}
                alt={product.w_title}
              /></a>

              <div className="shelf-item__details">
                <p className="title">TPMS Sensors</p>
                <p className="desc" style={{ fontSize: '12' }}>
                  TPMS SKU: TS2021S
                </p>
                <p className="desc">
                  Quantity: 4
                </p>
                <p className="desc" />
              </div>
                   <div className="shelf-item__price">
                      <div />
                      </div>
                    </div> }

              <div className="shelf-item__details" style={{ width: '75%' }}>
                <p className="title">In-Store Package - Staggered <p style={{ fontWeight: '600' }}>({product.car_make} {product.car_model})</p></p>
                <p className="desc" style={{ fontSize: '12' }}>
                  SKU: {product.p_id.slice(0, 7)}
                </p>
                <p className="desc">
                  Quantity: {product.quantity}
                </p>

              </div>
                   <div className="shelf-item__price">
                      <p id="discount" style={{ color: '#c50000' }}>{`$ ${formatPrice(product.price)}`}</p>
                      <div>
                        <button onClick={this.handleOnDecrease} disabled={product.quantity === 1} className="change-product-button">-</button>
                       <button onClick={this.handleOnIncrease} className="change-product-button">+</button>
                      </div>
                    </div>
            </div>
          );
        }
        return (
            <div className={classes.join(' ')}>
                             <Dialog open={this.state.showImage} onClose={(e) => this.handleCloseDialogImage(e)}
                          aria-labelledby="form-dialog-title" style={{ zIndex: '99999999999999999' }}>
                          <DialogTitle id="dialog-popup-inventiry-title" >
                          <a className="closebtnmain" onClick={(e) => this.handleCloseDialogImage(e)}>&times;</a>
                          </DialogTitle>
                          <DialogContent id="dialog-popup-inventiry-body" style={{ width: '550px', height: 'auto', overflow: 'hidden'  }}>
                              <img src={this.state.imageUrl} className='image' style={{ width: '550px', height: 'auto' }}/>
                          </DialogContent>
                        </Dialog>
              <div
                  className="shelf-item__del"
                  onMouseOver={() => this.handleMouseOver()}
                  onMouseOut={() => this.handleMouseOut()}
                  onClick={() => removeProduct(product)}
                />

                <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
                   <Thumb
                  classes="shelf-item__thumb"
                  src={ product.w_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.w_image.includes('panel.sorat.ca') ? product.w_image : product.w_image.includes('wheelpros') ? product.w_image : product.w_image.includes('directautoimport') ? product.w_image : product.w_image.includes('https://wheel') ? product.w_image : window.baseUrl + '/media/' + product.w_image}
                  alt={product.w_title}
                /></a>

                <div className="shelf-item__details">
                  <p className="title">{product.w_title}</p>
                  <p className="desc" style={{ fontSize: '12' }}>
                    Wheels SKU: {product.w_sku}
                  </p>
                  <p className="desc">
                    Quantity: 4
                  </p>
                  <p className="desc" />
                </div>

                     <div className="shelf-item__price">
                        <div />
                      </div>
                      <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
                      <Thumb
                  classes="shelf-item__thumb"
                  src={ product.t_image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.t_image.includes('panel.sorat.ca') ? product.t_image : product.t_image.includes('wheelpros') ? product.t_image : product.t_image.includes('directautoimport') ? product.t_image : product.t_image.includes('https://wheel') ? product.t_image : window.baseUrl + '/media/' + product.t_image}
                  alt={product.w_title}
                /></a>

                <div className="shelf-item__details">
                  <p className="title">{product.t_title}</p>
                  <p className="desc" style={{ fontSize: '12' }}>
                    Tires SKU: {product.t_sku}
                  </p>
                  <p className="desc">
                    Quantity: 4
                  </p>
                  <p className="desc" />
                </div>
                     <div className="shelf-item__price">
                        <div />
                        </div>

                   { product.tpms === '1' && <div>
                  <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
                  <Thumb
                  classes="shelf-item__thumb"
                  src={ window.baseUrl + '/media/tpms-service-schrader-tpms-sensor-sb-20720-1_grande.jpeg'}
                  alt={product.w_title}
                /></a>

                <div className="shelf-item__details">
                  <p className="title">TPMS Sensors</p>
                  <p className="desc" style={{ fontSize: '12' }}>
                    TPMS SKU: TS2021S
                  </p>
                  <p className="desc">
                    Quantity: 4
                  </p>
                  <p className="desc" />
                </div>
                     <div className="shelf-item__price">
                        <div />
                        </div>
                        </div> }

                <div className="shelf-item__details" style={{ width: '75%' }}>
                  <p className="title">In-Store Package <p style={{ fontWeight: '600' }}>({product.car_make} {product.car_model})</p></p>
                  <p className="desc" style={{ fontSize: '12' }}>
                    SKU: {product.p_id.slice(0, 7)}
                  </p>
                  <p className="desc">
                    Quantity: {product.quantity}
                  </p>

                </div>
                     <div className="shelf-item__price">
                        <p id="discount" style={{ color: '#c50000' }}>{`$ ${formatPrice(product.price)}`}</p>
                        <div>
                          <button onClick={this.handleOnDecrease} disabled={product.quantity === 1} className="change-product-button">-</button>
                         <button onClick={this.handleOnIncrease} className="change-product-button">+</button>
                        </div>
                      </div>
              </div>
        );
      }
      return (
            <div className={classes.join(' ')}>
                             <Dialog open={this.state.showImage} onClose={(e) => this.handleCloseDialogImage(e)}
                          aria-labelledby="form-dialog-title" style={{ zIndex: '99999999999999999' }}>
                          <DialogTitle id="dialog-popup-inventiry-title" >
                          <a className="closebtnmain" onClick={(e) => this.handleCloseDialogImage(e)}>&times;</a>
                          </DialogTitle>
                          <DialogContent id="dialog-popup-inventiry-body" style={{ width: '550px', height: 'auto', overflow: 'hidden'  }}>
                              <img src={this.state.imageUrl} className='image' style={{ width: '550px', height: 'auto' }}/>
                          </DialogContent>
                        </Dialog>
              <div
                className="shelf-item__del"
                onMouseOver={() => this.handleMouseOver()}
                onMouseOut={() => this.handleMouseOut()}
                onClick={() => removeProduct(product)}
              />

              <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
              <Thumb
                classes="shelf-item__thumb"
                src={ product.image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.image.includes('panel.sorat.ca') ? product.image : product.image.includes('wheelpros') ? product.image : product.image.includes('directautoimport') ? product.image : product.image.includes('https://wheel') ? product.image : window.baseUrl + '/media/' + product.image}
                alt={product.title}
              /></a>

              <div className="shelf-item__details">
                <p className="title">{product.name}</p>
                <p className="desc" style={{ fontSize: '12' }}>
                  SKU: {product.sku}
                </p>
                <p className="desc">
                  Quantity: {product.quantity}
                </p>
                </div>
                <div className="shelf-item__price">
                <p className="discount2" id="discount2" style={{ color: 'rgb(97 5 5)' }}>{`$ ${formatPrice(product.price)}`}</p>
                <div>
                  <button onClick={this.handleOnDecrease} disabled={product.quantity === 1} className="change-product-button">-</button>
                  <button onClick={this.handleOnIncrease} className="change-product-button">+</button>
                </div>
              </div>
            </div>
      );
    }

    return (
      <div className={classes.join(' ')}>
                       <Dialog open={this.state.showImage} onClose={(e) => this.handleCloseDialogImage(e)}
                          aria-labelledby="form-dialog-title" style={{ zIndex: '99999999999999999' }}>
                          <DialogTitle id="dialog-popup-inventiry-title" >
                          <a className="closebtnmain" onClick={(e) => this.handleCloseDialogImage(e)}>&times;</a>
                          </DialogTitle>
                          <DialogContent id="dialog-popup-inventiry-body" style={{ width: '550px', height: 'auto', overflow: 'hidden'  }}>
                              <img src={this.state.imageUrl} className='image' style={{ width: '550px', height: 'auto' }}/>
                          </DialogContent>
                        </Dialog>
        <div
          className="shelf-item__del"
          onMouseOver={() => this.handleMouseOver()}
          onMouseOut={() => this.handleMouseOut()}
          onClick={() => removeProduct(product)}
        />

        <a style={{display: 'contents'}} onClick={(e) => this.handleOpenimage(e, product.image)}>
        <Thumb
          classes="shelf-item__thumb"
          src={ product.image == 'no_selection' ? window.baseUrl + '/media/soratimg.jpg' : product.image.includes('panel.sorat.ca') ? product.image : product.image.includes('wheelpros') ? product.image : product.image.includes('directautoimport') ? product.image : product.image.includes('https://wheel') ? product.image : window.baseUrl + '/media/' + product.image}
          alt={product.title}
        /></a>

        <div className="shelf-item__details">
          <p className="title">{product.name}</p>
          <p className="desc" style={{ fontSize: '12' }}>
            SKU: {product.sku}
          </p>
          <p className="desc">
            Quantity: {product.quantity}
          </p>

        </div>
        <div className="shelf-item__price">
          <p className="discount2" id="discount2" style={{ color: 'rgb(97 5 5)', textDecoration: 'line-through' }}>{`$ ${formatPrice(product.price)}`}</p>
          <p id="discount" style={{ color: '#c50000' }}>{`$ ${formatPrice(product.promo[0])}`}</p>

          <div>
            <button onClick={this.handleOnDecrease} disabled={product.quantity === 1} className="change-product-button">-</button>
            <button onClick={this.handleOnIncrease} className="change-product-button">+</button>
          </div>
        </div>
      </div>
    );

  }
}

export default CartProduct;
