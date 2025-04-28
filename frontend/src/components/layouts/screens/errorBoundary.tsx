import { Button, Modal } from "antd";
import React from "react";
import error_img from "src/assets/images/500_error.png";

export default class ErrorBoundary extends React.Component {
  // Constructor for initializing Variables etc in a state
  // Just similar to initial line of useState if you are familiar
  // with Functional Components
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  // This method is called if any error is encountered
  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and
    // re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log error messages to an error
    // reporting service here
  }

  render() {
    console.log("$$$$$$$$$$$", this.state);
    const handleClose = () => {
      this.setState({ error: null, errorInfo: null });
    };
    return (
      <>
        {this.state.errorInfo ? (
          <Modal footer={null} open width="70%" onCancel={() => handleClose()}>
            <>
              <img src={error_img} style={{ height: "250px", width: "600px", objectFit: "cover" }} />
              <h6>An Error Has Occurred</h6>
              <details className="cp " style={{ maxHeight: "200px", overflowY: "scroll" }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
              <div className="ae mt-3">
                <Button onClick={handleClose}>Reload</Button>
              </div>
            </>
          </Modal>
        ) : (
          this.props.children
        )}
      </>
    );

    // Normally, just render children, i.e. in
    // case no error is Found
  }
}
