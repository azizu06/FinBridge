import { useTranslation } from 'react-i18next';
import Header from './Header';
import './App.css';

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
