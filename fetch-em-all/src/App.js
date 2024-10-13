import './App.css';
import React, { useEffect, useState } from 'react';

function LocationList() {
  const [locations, setLocations] = useState([]);
  const [encounteredPokemon, setEncounteredPokemon] = useState(null);
  const [showLocations, setShowLocations] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [userPokemonList, setUserPokemonList] = useState([]);

  const usersPokemon = [
    "https://pokeapi.co/api/v2/pokemon/bulbasaur",
    "https://pokeapi.co/api/v2/pokemon/charizard",
    "https://pokeapi.co/api/v2/pokemon/mewtwo"
  ];

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/location')
      .then(response => response.json())
      .then(data => setLocations(data.results.slice(0, 20)));
  }, []);

  useEffect(() => {
    Promise.all(usersPokemon.map(url => 
      fetch(url)
      .then(response => response.json())))
      .then(data => setUserPokemonList(data));
  }, []);

  const handleLocationClick = (url) => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const areaUrl = data.areas[Math.floor(Math.random() * data.areas.length)].url;
        fetch(areaUrl)
          .then(response => response.json())
          .then(areaData => {
            if (areaData.pokemon_encounters && areaData.pokemon_encounters.length > 0) {
              const pokemonUrl = areaData.pokemon_encounters[Math.floor(Math.random() * areaData.pokemon_encounters.length)].pokemon.url;
              fetch(pokemonUrl)
                .then(response => response.json())
                .then(pokemonData => {
                  setEncounteredPokemon(pokemonData);
                  setShowLocations(false);
                });
            } else {
              setShowLocations(false);
              setEncounteredPokemon(null);
            }
          });
      });
  };

  const handleUserPokemonClick = (pokemon) =>{
    setSelectedPokemon(pokemon);
  };

  const handleReset = () => {
    setShowLocations(true);
    setEncounteredPokemon(null);
    setSelectedPokemon(null);
  };

  //last task - THE ENCOUNTER
  const calculateDamage = () => {
    if(encounteredPokemon && selectedPokemon) {
      const attackerAttack = selectedPokemon.stats.find(
        (stat) => stat.stat.name === "attack").base_stat;
      const defenderDefense = encounteredPokemon.stats.find(
      (stat) => stat.stat.name === "defense").base_stat;

      const z = Math.floor(Math.random() * (255 - 217 + 1) + 217);
      const damage = Math.floor(
        ((((2 / 5 + 2) * attackerAttack * 60) / defenderDefense / 50 + 2) * z) / 255
        );
        return damage
    }
    return 0
  }

  const handleAttack = (hp) => {
    if(encounteredPokemon && selectedPokemon) {
      const damage = calculateDamage();
      console.log(
        encounteredPokemon.name + " HP: " + encounteredPokemon.stats.filter((stat) => stat.stat.name=== "hp")[0].base_stat
      );

      const updatedEncounteredPokemon = {
        ...encounteredPokemon,
        stats: [
          ...encounteredPokemon.stats.filter((stat) => stat.stat.name !== "hp"),
          {
            base_stat: encounteredPokemon.stats.find((stat) => stat.stat.name === "hp").base_stat - damage,
            stat: {
              name: "hp"
            }
          }
        ]
      }
      setEncounteredPokemon(updatedEncounteredPokemon);

      const updatedSelectedPokemon = {
        ...selectedPokemon,
        stats: [
          ...selectedPokemon.stats.filter((stat) => stat.stat.name !== "hp"),
          {
            base_stat: selectedPokemon.stats.find((stat) => stat.stat.name === "hp").base_stat - damage,
            stat: {
              name: "hp"
            }
          }
        ]
      }
      setSelectedPokemon(updatedSelectedPokemon);
      console.log(
        selectedPokemon.name + " HP: " + selectedPokemon.stats.filter((stat) => stat.stat.name=== "hp")[0].base_stat
      );


      if(updatedEncounteredPokemon.stats.filter((stat) => stat.stat.name=== "hp")[0].base_stat <= 0) {
        setUserPokemonList((prev) => [...prev, encounteredPokemon]);
    
        setSelectedPokemon(null);
        setEncounteredPokemon(null);
      }

    }
  }
 
  return (
    <div>
      {showLocations ? (
        <div>
          <h1>Locations</h1>
          <ul>
            {locations.map(location => (
              <li key={location.name} onClick={() => handleLocationClick(location.url)}>
                {location.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          {encounteredPokemon ? (
            <div>
              <h2>Encountered Pokemon</h2>
              <h3>{encounteredPokemon.name}</h3>
              <img src={encounteredPokemon.sprites.front_default} alt={encounteredPokemon.name} />
              <h4>Base Stat: {encounteredPokemon.stats[0].base_stat}</h4>
              {selectedPokemon ? (
                <div>
                  <h2>Your Selected Pokemon</h2>
                  <h3>{selectedPokemon.name}</h3>
                  <img src={selectedPokemon.sprites.front_default} alt={selectedPokemon.name} />
                  <h4>Base Stat: {selectedPokemon.stats[0].base_stat}</h4>
              
                  <button onClick={handleAttack}>Attack</button>
                </div>
              ) : (
                <div>
                  <h2>Your Pokemon List</h2>
                  <ul>
                    {userPokemonList.map(pokemon => (
                      <li key={pokemon.name} onClick={() => handleUserPokemonClick(pokemon)}>
                        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                        {pokemon.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p>This location doesn't seem to have any Pokemon.</p>
              <button onClick={handleReset}>Go Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationList;