I’m going to do with the simplest one — marking red the bad inputs, without anything else


## How to represent errors?

To indicate whether a particular input is valid, without any additional information as to why it is invalid, something like this will suffice:

	errors: {
	  name: false,
	  email: true,
	}


`false` means no errors aka entirely valid; `true` means a field is invalid.


## But how is this error object created?


We are going to need a validation function for that. It will accept the current values of the fields and returns us the errors object.

	function validate(email, password) {
	  // true means invalid, so our conditions got reversed
	  return {
	    email: email.length === 0,
	    password: password.length === 0,
	  };
	}


We have a validation function and know how we want to show errors.


## We also have a form.


- Run the validator in render.

It’s no use having the validate function if we never call it. We want to validate the inputs every time (yes, every time) the form is re-rendered, which can be because of a new character in the input.


	const errors = validate(this.state.email, this.state.password);



- Disable the button.

This is a simple one. The button should be disabled if there are any errors, or, in other words, if any of errors values are true.


	const isEnabled = !Object.keys(errors).some(x => errors[x]);



- Mark the inputs as erroneous.

This can be anything. For our case, adding an error class to the bad inputs will be just enough.


	<input
	  className={errors.email ? "error" : ""}
	  ...
	/>


- And we can add a simple CSS rule:


	.error { border: 1px solid red; }



## 所有的代码

	function validate(email, password) {
	  // true means invalid, so our conditions got reversed
	  return {
	    email: email.length === 0,
	    password: password.length === 0,
	  };
	}
	
	class SignUpForm extends React.Component {
	  constructor() {
	    super();
	    this.state = {
	      email: '',
	      password: '',
	      
	      everFocusedEmail: false,
	      everFocusedPassword: false,
	      inFocus: '',
	    };
	  }
	  
	  handleEmailChange = (evt) => {
	    this.setState({ email: evt.target.value });
	  }
	  
	  handlePasswordChange = (evt) => {
	    this.setState({ password: evt.target.value });
	  }
	  
	  handleSubmit = (evt) => {
	    if (!this.canBeSubmitted()) {
	      evt.preventDefault();
	      return;
	    }
	    const { email, password } = this.state;
	    alert(`Signed up with email: ${email} password: ${password}`);
	  }
	  
	  canBeSubmitted() {
	    const errors = validate(this.state.email, this.state.password);
	    const isDisabled = Object.keys(errors).some(x => errors[x]);
	    return !isDisabled;
	  }
	  
	  render() {
	    const errors = validate(this.state.email, this.state.password);
	    const isDisabled = Object.keys(errors).some(x => errors[x]);
	    return (
	      <form onSubmit={this.handleSubmit}>
	        <input
	          className={errors.email ? "error" : ""}
	          type="text"
	          placeholder="Enter email"
	          value={this.state.email}
	          onChange={this.handleEmailChange}
	        />
	        <input
	          className={errors.password ? "error" : ""}
	          type="password"
	          placeholder="Enter password"
	          value={this.state.password}
	          onChange={this.handlePasswordChange}
	        />
	        <button disabled={isDisabled}>Sign up</button>
	      </form>
	    )
	  }
	}
	
	ReactDOM.render(<SignUpForm />, document.body);




## One more thing

If you look at the JS Bin above, you may notice something odd. The fields are marked red by default, because empty fields are invalid but…

We never even gave a user a chance to type first! Also, the fields are still red while focused for the first time.

We are going to do that by adding the error class if the field was in focus at least once but has since been blurred.

This ensures that the first time a user focuses the field, the error won’t appear right away, but instead, only when the field is blurred. On subsequent focuses, though, the error would be shown.

This is easily achievable by using the onBlur event, and state to keep track of what was blurred.



	class SignUpForm extends React.Component {
	  constructor() {
	    super();
	    this.state = {
	      email: '',
	      password: '',
	      touched: {
	        email: false,
	        password: false,
	      },
	    };
	  }
	
	  // ...
	
	  handleBlur = (field) => (evt) => {
	    this.setState({
	      touched: { ...this.state.touched, [field]: true },
	    });
	  }
	
	  render()
	    const shouldMarkError = (field) => {
	      const hasError = errors[field];
	      const shouldShow = this.state.touched[field];
	
	      return hasError ? shouldShow : false;
	    };
	
	    // ...
	
	    <input
	      className={shouldMarkError('email') ? "error" : ""}
	      onBlur={this.handleBlur('email')}
	
	      type="text"
	      placeholder="Enter email"
	      value={this.state.email}
	      onChange={this.handleEmailChange}
	    />
	  }
	}



## 所有的代码

	function validate(email, password) {
	  // true means invalid, so our conditions got reversed
	  return {
	    email: email.length === 0,
	    password: password.length === 0,
	  };
	}
	
	class SignUpForm extends React.Component {
	  constructor() {
	    super();
	    this.state = {
	      email: '',
	      password: '',
	      
	      touched: {
	        email: false,
	        password: false,
	      },
	    };
	  }
	  
	  handleEmailChange = (evt) => {
	    this.setState({ email: evt.target.value });
	  }
	  
	  handlePasswordChange = (evt) => {
	    this.setState({ password: evt.target.value });
	  }
	  
	  handleBlur = (field) => (evt) => {
	    this.setState({
	      touched: { ...this.state.touched, [field]: true },
	    });
	  }
	  
	  handleSubmit = (evt) => {
	    if (!this.canBeSubmitted()) {
	      evt.preventDefault();
	      return;
	    }
	    const { email, password } = this.state;
	    alert(`Signed up with email: ${email} password: ${password}`);
	  }
	  
	  canBeSubmitted() {
	    const errors = validate(this.state.email, this.state.password);
	    const isDisabled = Object.keys(errors).some(x => errors[x]);
	    return !isDisabled;
	  }
	  
	  render() {
	    const errors = validate(this.state.email, this.state.password);
	    const isDisabled = Object.keys(errors).some(x => errors[x]);
	    
	    const shouldMarkError = (field) => {
	      const hasError = errors[field];
	      const shouldShow = this.state.touched[field];
	      
	      return hasError ? shouldShow : false;
	    };
	    
	    return (
	      <form onSubmit={this.handleSubmit}>
	        <input
	          className={shouldMarkError('email') ? "error" : ""}
	          type="text"
	          placeholder="Enter email"
	          value={this.state.email}
	          onChange={this.handleEmailChange}
	          onBlur={this.handleBlur('email')}
	        />
	        <input
	          className={shouldMarkError('password') ? "error" : ""}
	          type="password"
	          placeholder="Enter password"
	          value={this.state.password}
	          onChange={this.handlePasswordChange}
	          onBlur={this.handleBlur('password')}
	        />
	        <button disabled={isDisabled}>Sign up</button>
	      </form>
	    )
	  }
	}
	
	ReactDOM.render(<SignUpForm />, document.body);


## Final touches

Note that shouldMarkError only affects field presentation. The status of the submit button still depends only on validation errors.

A nice final touch might be to force display of errors on all fields, regardless of whether they have been in focus, when the user hovers or clicks a disabled submit button.



*[转译自goshakkk.name](https://goshakkk.name/instant-form-fields-validation-react/)*