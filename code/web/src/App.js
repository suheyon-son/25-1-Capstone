import logo from './logo.svg';
import './App.css';

function App() {
  const callExpress = async () => {
    try{
      const res = await fetch('/api/express-endpoint', {method: 'GET'});
      const data = await res.json();
      alert('Express response: ' + JSON.stringify(data));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const callExpressToFlask = async () => {
    try{
      const res = await fetch('api/call-flask', { method: 'GET'});
      const data = await res.json();
      alert('Express to Flask response: ' + JSON.stringify(data));
    }
    catch (error) {
      alert('Error: ' + error.message);
    }
  }

  return (
    <div className="App">
      <h1>Hellow World!</h1>
      <h3>이 문장이 보인다면 CI/CD 테스트가 성공한 것입니다.</h3>
      <button onClick={callExpress}>Call Express</button><br/>
      <button onClick={callFlaskDirect}>Call Flask Direct</button><br/>
      <button onClick={callExpressToFlask}>Call Express to Flask</button><br/>
    </div>
  );
}

export default App;
