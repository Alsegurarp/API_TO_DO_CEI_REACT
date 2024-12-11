import dotenv from 'dotenv';
dotenv.config();
import { MongoClient, ObjectId} from "mongodb"

//Hacer una copia de lo que era en PostgreSQL pero con MongoDB
//MongoDB para conectarte

const MONGO_URL = process.env.MONGO_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

//Primero necesitas conectarte, puedes hacerlo con una function para conectar - Nunca falla
//MongoDB se conecta y luego hace cosas
//Consultas para crear, borrar, editar y leer en la base de datos

// Función para conectar a la base de datos
function conectar(){
    return MongoClient.connect(MONGO_URL)
    //Primero te conectas a la base de datos - la usaremos para automatizar
    //Esto retorna una promesa que nos da una conexion - por ser promesa puede fallar 
    //Se puede usar con un await o un .then()
}

//Leer tarea no requiere argumento, entonces va vacio
export function leerTarea(){
  return new Promise(async(ok,ko) => {
    let conexion = null;
      try{
          conexion = await conectar()

          let coleccion = conexion.db("sistemacrud").collection("taks")

          let tareas = await coleccion.find({}).toArray();
          //Necesito las tareas, entonces .find({]) porque no tiene filtro de busqueda .toArray() para hacerlo en formato legible

          //Sé que las tareas tienen estas propiedades
          tareas = tareas.map(({_id,tarea,estado}) => {
            //Se hace un nuevo objeto pero tomando los valores declarados antes
              return {id : _id, tarea, estado}
          })
          
          ok(tareas);

      }catch(error){
          ko({error: "error en la base de datos"})
      }finally{
        conexion.close();
      }
  });
}

export function crearTarea(tarea){
    return new Promise(async(ok,ko) => {
      let conexion = null;
        try{
            conexion = await conectar()
            //Nos conectamos - está dentro del try porque puede fallar
            let coleccion = conexion.db("sistemacrud").collection("taks")
            //Ahora debemos de declarar en que base de datos y coleccion estará
            let id = await coleccion.insertOne({tarea, estado : false})
            //espera que en el clustr en la base de datos se inserte el objeto
            //tarea y estado porque son cosas que quieres - puedes poner cualquier informacion en mongoDB, no debes crear campos antes

            ok(id);
        }catch(error){
            ko({error: "error en la base de datos"})
        }finally{
          conexion.close();
        }
    });
}

export function borrarTarea(id){
  return new Promise(async(ok,ko) => {
    let conexion = null;
      try{
          conexion = await conectar()

          let coleccion = conexion.db("sistemacrud").collection("taks")

          let {deletedCount} = await coleccion.deleteOne({ _id : new ObjectId(id)})
          //deleteOne para borrar el elemento que encaje con mi busqueda
          
          ok(deletedCount);

      }catch(error){
          ko({error: "error en la base de datos"})
      }finally{
        conexion.close();
      }
  });
}
//Para editar recibimos el id del elemento y el texto a modificar
export function editarTarea(id, texto){
  return new Promise(async(ok,ko) => {
    let conexion = null;
      try{
          conexion = await conectar()

          let coleccion = conexion.db("sistemacrud").collection("taks")

          let {modifiedCount} = await coleccion.updateOne({ _id : new ObjectId(id)}, {$set : { tarea: texto}})
          //UpdateOne para editar uno, despues la busqueda del elemento y $set para asignar el nuevo valor
          ok(modifiedCount);

      }catch(error){
          ko({error: "error en la base de datos"})
      }finally{
        conexion.close();
      }
  });
}

//Para cambiar el estado de la tarea
export function editarEstado(id){
  return new Promise(async(ok,ko) => {
    let conexion = null;
      try{
        conexion = await conectar()

          let coleccion = conexion.db("sistemacrud").collection("taks")

          let {estado} = await coleccion.findOne({_id : new ObjectId(id)})

          console.log(estado);

          let x = await coleccion.updateOne({ _id : new ObjectId(id)}, {$set : { estado: !estado}})
          //Una vez que encuentres el estado de la tarea, quiero que lo actualices y coloques lo contrario a su estado actual 'true or false'
          
          ok(x);

      }catch(error){
          ko({error: "error en la base de datos"})
      }finally{
        conexion.close();
      }
  });
}

