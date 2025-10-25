import { useTranslation } from 'react-i18next';
import './App.css';
import Header from './Header.jsx';

function App() {

  const {t} = useTranslation();

  return (
    <>
      <div>
        <Header />
      </div>
    </>
  )
}

export default App
