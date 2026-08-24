import '@testing-library/jest-dom';

// Polyfill global WebSocket for test runner
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class MockWebSocket {
    constructor() {
      this.readyState = 0;
      setTimeout(() => {
        this.readyState = 1;
        if (this.onopen) this.onopen();
      }, 10);
    }
    send() {}
    close() {
      this.readyState = 3;
      if (this.onclose) this.onclose();
    }
  };
}
