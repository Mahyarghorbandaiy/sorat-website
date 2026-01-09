import React from 'react';
import { withRouter } from 'react-router';
import '../statics/stylesheet.css';
import '../statics/BrandList.css';


class BrandList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  getBrands(category) {
    let url = '';

    if (category === 'Tires') {
      url = window.baseUrl + '/apii/brands.php?type=Tires';
    } else if (category === 'Wheels') {
      url = window.baseUrl + '/apii/brands.php?type=Wheels';
    }

    this.setState({ loading: true });

    fetch(url)
      .then(response => {
        return response.json();
      }).then(json => {
        this.setState({ loading: false, brands: json });
      });

    return true;
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillMount() {
    const { params } = this.props;
    if (params.category) {
      this.getBrands(params.category);
    } else {
      const { router } = this.context;
      router.push('/');
    }
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  brandsearch = (name) => {
    const { router } = this.context;
    const { params } = this.props;

    localStorage.setItem("Brand", name);
    router.push('/' + params.category.replace(/ /g, '%20') + '/' + params.search_by + '/' + name.split(' ').join('%20'));
  };

  render() {
    const { router } = this.context;
    const { loading, brands } = this.state;
    const { params } = this.props;

    if (loading) {
      return (
        <div className="content-divLength">
          { navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ?
                <img src={window.host + '/statics/img/loading.svg'} /> :
                <img src={window.host + '/statics/img/loading.gif'} /> }
        </div>
      );
    } else if (brands) {
      return (
        <div id="brandlist" className="brandList-brandBlock">

        <div className="header_container" style={{paddingTop: '145px'}}>
          <h3 className="brand_tires_label">{params.category}</h3>
          <h2 className="content-titleFont">Select a Brand</h2>
        </div>
          <div className="brandList-brandContainer">
            {brands.map((brand, i) => {
              if (brand.brand) {
                return (
                  <div key={i} className="brandList-brandDiv">
                    <input type='image'
                      onClick={() => this.brandsearch(brand.brand.split(' ').join('%20'))}
                      src={window.baseUrl + '/media/brands/' + brand.brand + '.jpg'}
                      alt={brand.brand}
                      className="brandList-brandImage" />
                    <div style={{ paddingTop: 15 }}>{brand.brand}</div>
                  </div>
                );
              }
              return <div>No Brand Name</div>;
            })}
          </div>
        </div>
      );
    }
    return <div>No Data</div>;
  }
}

BrandList.propTypes = {
  params: React.PropTypes.object.isRequired
};

BrandList.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default withRouter(BrandList);
