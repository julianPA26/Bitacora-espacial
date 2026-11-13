import { useState, useEffect } from "react";
import NoticiaCard from "./components/NoticiaCard/NoticiaCard";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [termino, setTermino] = useState("");

  function buscar(evento) {
    evento.preventDefault();
    const formData = new FormData(evento.target);
    const valor = formData.get("q") || "";
    setTermino(valor.trim());
  }

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    const params = new URLSearchParams({
      limit: 12,
      search: termino,
    });

    fetch(`${VITE_API_URL}/articles/?${params.toString()}`, {
      signal: controlador.signal,
    })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        return respuesta.json();
      })
      .then((datos) => {
        setNoticias(datos.results);
        setCargando(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [termino]);

  return (
    <>
      <header className="contenedor-cabecera">
        <p>Bitacora-espacial</p>
        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="#Blogs">Blogs</a>
          <a href="#Acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor">
        <h1>Bitacora-espacial</h1>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input
            id="busqueda"
            name="q"
            type="search"
            placeholder="Ej.: Mars, Artemis, SpaceX"
          />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="Resultados">
          <h2 id="Resultados">Ultimas Noticias</h2>

          {cargando && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">Error al cargar noticias: {error}</p>}
          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}

          <div className="grid-noticias">
            {noticias.map((noticia) => (
              <NoticiaCard
                key={noticia.id}
                titulo={noticia.title}
                resumen={noticia.summary}
                imagen={noticia.image_url}
                fuente={noticia.news_site}
                fecha={noticia.published_at}
                enlace={noticia.url}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="contenedor">
        <p>Spaceflight News API</p>
      </footer>
    </>
  );
}

export default App;
