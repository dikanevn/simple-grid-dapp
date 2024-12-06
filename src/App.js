import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';  // Импортируем ethers.js
import SimpleGridABI from './SimpleGridABI.json';  // Ваш ABI файла контракта
import './App.css';

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(false);
  const contractAddress = "0x56f6bB37cB1Cb27d653e436DCCdE222cE4656FdA";  // Замените на ваш адрес контракта

  // Функция для подключения к Metamask
  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);  // Web3 провайдер
      await prov.send('eth_requestAccounts', []);  // Запрашиваем доступ к аккаунту
      const signer = prov.getSigner();  // Получаем signer для взаимодействия с контрактом
      const contractInstance = new ethers.Contract(contractAddress, SimpleGridABI, signer);  // Инициализируем контракт
      setProvider(prov);  // Сохраняем провайдер
      setContract(contractInstance);  // Сохраняем контракт
    } else {
      alert("Установите Metamask!");
    }
  };

  // Функция для получения данных сетки
  const fetchGrid = async () => {
    setLoading(true);  // Устанавливаем статус загрузки
    const tempGrid = [];
    if (contract) {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          const cell = await contract.getCell(x, y);  // Получаем содержимое ячейки
          tempGrid.push({ x, y, content: cell });
        }
      }
      setGrid(tempGrid);  // Обновляем состояние с новыми данными
    }
    setLoading(false);  // Останавливаем загрузку
  };

  // Функция для размещения "ора"
  const placeOre = async (x, y) => {
    if (contract) {
      try {
        await contract.placeOre(x, y);  // Размещаем "ор" в ячейке
        fetchGrid();  // Обновляем сетку после размещения
      } catch (error) {
        console.error("Ошибка размещения:", error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Simple Grid DApp</h1>
      {!provider ? (
        <button onClick={connectWallet}>Подключить кошелёк</button>
      ) : (
        <div>
          <button onClick={fetchGrid} disabled={loading}>
            {loading ? "Загрузка..." : "Показать сетку"}
          </button>
          <div>
            {grid.map((cell, index) => (
              <div key={index}>
                <p>Ячейка ({cell.x}, {cell.y}): {cell.content}</p>
                {cell.content === "Empty" && (
                  <button onClick={() => placeOre(cell.x, cell.y)}>
                    Разместить Ор
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
