// 定义 （状态 -> 动作 -> 下一个状态）的集合
const machine = {
  currentState: 'login form',
  states: {
    'login form': {
      submit: 'loading'
    },
    'loading': {
      success: 'profile',
      failure: 'error'
    },
    'profile': {
      viewProfile: 'profile',
      logout: 'login form'
    },
    'error': {
      tryAgain: 'loading'
    }
  }
}


const input = function (name) {
  const state = machine.currentState;
 
  if (machine.states[state][name]) {
    machine.currentState = machine.states[state][name];
  }
  console.log(`${ state } + ${ name } --> ${ machine.currentState }`);
}



input('tryAgain');
// login form + tryAgain --> login form
 
input('submit');
// login form + submit --> loading
 
input('submit');
// loading + submit --> loading
 
input('failure');
// loading + failure --> error
 
input('submit');
// error + submit --> error
 
input('tryAgain');
// error + tryAgain --> loading
 
input('success');
// loading + success --> profile
 
input('viewProfile');
// profile + viewProfile --> profile
 
input('logout');
// profile + logout --> login form
--------------------- 
