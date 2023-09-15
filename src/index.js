import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import { BrowserRouter } from 'react-router-dom';
import ReactDomClient from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = ReactDomClient.createRoot(container);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);