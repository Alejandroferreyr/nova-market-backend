// server.js - El cerebro puente para Nova Market V6
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permite que tu Netlify lea este servidor
app.use(express.json());

// CONFIGURACIÓN DE TU NEGOCIO
const MARGEN_GANANCIA = 1.35; // Multiplica por 1.35 para ganar el 35%
const ID_SITIO = "MLA"; // MLA = Mercado Libre Argentina

// RUTA PRINCIPAL: Busca productos masivamente en Mercado Libre por palabra clave
app.get('/api/productos', async (req, res) => {
    const queryBusqueda = req.query.q || "auriculares gamer"; // Búsqueda por defecto
    
    try {
        // Consultamos directamente al servidor de Mercado Libre
        const urlML = `https://api.mercadolibre.com/sites/${ID_SITIO}/search?q=${encodeURIComponent(queryBusqueda)}&limit=50`;
        const respuesta = await axios.get(urlML);
        
        // Saneamos y transformamos los miles de productos al formato de Nova Market
        const productosProcesados = respuesta.data.results.map(prod => {
            return {
                id: prod.id,
                nombre: prod.title,
                // Reemplazamos la imagen miniatura por la de alta resolución de ML
                imagen: prod.thumbnail.replace("-I.jpg", "-O.jpg"), 
                precio_original: prod.price,
                precio_nova: Math.round(prod.price * MARGEN_GANANCIA), // Cálculo de tu ganancia
                link_original: prod.permalink,
                proveedor: "Mercado Libre Proveedor Fiel",
                // Simulamos variantes basadas en los datos técnicos de ML
                colores: ["Original de Fábrica"],
                talles: prod.attributes.find(a => a.id === "SIZE") ? [prod.attributes.find(a => a.id === "SIZE").value_name] : []
            };
        });

        res.json({
            estado: "Sincronizado con ML con éxito",
            cantidad: productosProcesados.length,
            resultados: productosProcesados
        });

    } catch (error) {
        console.error("Error conectando con la API de Mercado Libre:", error);
        res.status(500).json({ error: "No se pudo conectar con el servidor de Mercado Libre" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor puente Nova Core corriendo en puerto ${PORT}`);
});