# Reglas de Firestore UNIFICADAS 📄

He mezclado tus reglas actuales (Carpeta personal de usuario) con las nuevas reglas necesarias para el **Directorio de Profesores**.

### Copia y pega este contenido en Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. REGLA EXISTENTE: Carpeta personal del usuario
    // (Mantiene la restricción de correo @alumnos.udg.mx)
    match /users/{userId}/{document=**} {
      allow read, write: if 
          request.auth != null 
          && request.auth.uid == userId
          && request.auth.token.email.matches('.*@alumnos[.]udg[.]mx');
    }

    // 2. PROFESORES: Caché de MisProfesores.com
    // - Lectura: cualquier persona (pública)
    // - Escritura: cualquier persona (para caching del scraper sin auth)
    match /professors/{professorId} {
      allow read: if true;
      allow write: if true;  // Scraping ohne Auth erlaubt
    }

    // 3. RATINGS: Reseñas de la comunidad
    // - Lectura: cualquier persona
    // - Escritura: solo usuarios con correo institucional @alumnos.udg.mx
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null 
          && request.auth.token.email.matches('.*@alumnos[.]udg[.]mx');
      
      // Solo el autor puede editar o eliminar su propia calificación
      allow update, delete: if request.auth != null 
          && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Notas adicionales:

- **Caching del Scraping**: La regla `allow write: if true` en `/professors/` permite que la API guarde datos sin autenticación (necesario para el scraping de MisProfesores.com)
- **Ratings**: Mantiene restricción de correo institucional `@alumnos.udg.mx` para crear nuevas evaluaciones
