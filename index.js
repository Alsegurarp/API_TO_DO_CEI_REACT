import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import { borrarTarea, editarEstado, editarTarea, leerTarea } from "./db.js";

// Cargar variables de entorno
dotenv.config();

//Invocas el servidor
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json());

if(process.env.PRUEBAS){
    app.use(express.static("./pruebas"))
} //Para que use el index de la carpeta pruebas

// Endpoint para obtener las tareas
app.get("/tareas", async (req, res) => {
  try {
    let tareas = await leerTarea();

    res.json(tareas)
  } catch (err) {
    console.error("Error al obtener tareas:", err);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

app.post("/tareas/nueva", async (peticion,respuesta, siguiente) => {
    let {tarea} = peticion.body;

    if(!tarea || tarea.trim() == ""){
        return
    }
})

app.delete("/tareas/borrar/:id([0-9a-f]{24})", async (peticion, respuesta) => {
    try{
        let {id} = peticion.params;
        //Es un numero
        let cantidad = await borrarTarea(id);
        respuesta.json({resultado : cantidad ? "ok" : "ko"})
    }catch(error){
        respuesta.status(500)
        respuesta.json({error : "error en el servidor"})
    }
})


app.put("/tareas/actualizar/:id([0-9a-f]{24})/1", async (peticion,respuesta, siguiente) => {
    // /1 al final de la url ya que se refiere al primer escenario a cubrir
    // se coloca siguiente ya que no debemos validar el id
    //function async porque es un proceso que debe esperar otros procesos

    let {id} = peticion.params;
    let {tarea} = peticion.body;

    if(!tarea || tarea.trim() == ""){
        return siguiente(true)
        //Si la tarea es vacia o no es tarea, manda la peticion al error
    }
    //Obtienes el id y verificas que la tarea no esté vacía.
    try{
        let cantidad = await editarTarea(id, tarea);
        respuesta.json({resultado : cantidad ? "ok" : "ko"})
    }catch(error){
        respuesta.status(500)
        respuesta.json({error : "error en el servidor"})
    }
})

app.put("/tareas/actualizar/:id([0-9a-f]{24})/2", async (peticion,respuesta) => {
    // /2 porque es el 2do proceso - editar estado

    let {id} = peticion.params;

    //Obtienes el id 
    try{
        let cantidad = await editarEstado(id);
        respuesta.json({resultado : cantidad ? "ok" : "ko"})
    }catch(error){
        respuesta.status(500)
        respuesta.json({error : "error en el servidor"})
    }
})

//poner errores aqui
app.use((error, peticion, respuesta, siguiente) => {
    respuesta.status(400);
    respuesta.json({ error : "error en la peticion"});
    });

app.use((peticion, respuesta) => {
        respuesta.status(404);
        respuesta.json({ error : "recurso no encontrado"});
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
