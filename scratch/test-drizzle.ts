import { db } from '../backend/src/db/db';
import { clientes } from '../backend/src/db/schema';

try {
    const res = db.insert(clientes).values({ nomeCompleto: 'Test' }).returning().get();
    console.log("get() result:", res);
} catch (e) {
    console.error("Error with get():", e);
}
