import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui';
import './modal.css';

const Modal = ({ description, onCloseModal, openModal, fullScreen = true, children, back }) => {
  return (
		<Dialog open={openModal} onClose={onCloseModal} fullScreen={fullScreen} PaperProps={back} style={{ zIndex: '214748368' }}>
			<DialogTitle >
				
			</DialogTitle>

			<DialogContent id='title1'>
				<DialogContentText>{children}</DialogContentText>
			</DialogContent>
			<DialogActions />
		</Dialog>
  );
};

Modal.propTypes = {
  description: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  openModal: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  data: PropTypes.object,
  fullScreen: PropTypes.bool
};

export default Modal;
