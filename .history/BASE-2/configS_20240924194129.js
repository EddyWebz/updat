// Función para inicializar la lógica de Sub-usuarios
function initConfigSesion() {
    // Manejar el formulario de creación de sub-usuarios
    const subUserForm = document.getElementById('subUserForm');
    subUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const subUserName = document.getElementById('subUserName').value;
        const subUserEmail = document.getElementById('subUserEmail').value;
        const subUserPassword = document.getElementById('subUserPassword').value;

        try {
            const response = await fetch('/api/sub-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subUserName, subUserEmail, subUserPassword }),
                credentials: 'include',
            });

            if (response.ok) {
                alert('Sub-usuario creado exitosamente');
                subUserForm.reset();
                loadSubUsers(); // Recargar la lista de sub-usuarios
            } else {
                alert('Error al crear el sub-usuario');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

//FUNCION OCULTAR-MOSTRAR SUB-USUARIOS
    function toggleSubUserList() {
        const subUserList = document.getElementById('subUserList');
        const toggleButton = document.getElementById('toggleSubUserList');
    
        if (subUserList.style.display === 'none') {
            subUserList.style.display = 'block';
            toggleButton.textContent = 'Ocultar Sub-usuarios';
        } else {
            subUserList.style.display = 'none';
            toggleButton.textContent = 'Mostrar Sub-usuarios';
        }
    }
    

// Cargar la lista de sub-usuarios
async function loadSubUsers() {
    try {
        const response = await fetch('/api/sub-users', {
            method: 'GET',
            credentials: 'include',
        });
        const subUsers = await response.json();
        const subUserList = document.getElementById('subUserList');
        subUserList.innerHTML = ''; // Limpiar la lista

        subUsers.forEach((subUser) => {
            const subUserDiv = document.createElement('div');
            subUserDiv.innerHTML = `
                <span>${subUser.name}</span>  <!-- Solo se muestra el nombre del sub-usuario -->
                <button data-email="${subUser.email}" class="deleteSubUserBtn">Eliminar</button>
            `;
            subUserList.appendChild(subUserDiv);
        });

        // Añadir eventos para los botones de eliminación
        const deleteButtons = document.querySelectorAll('.deleteSubUserBtn');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', async (e) => {
                const subUserEmail = e.target.getAttribute('data-email');
                await deleteSubUser(subUserEmail);
                loadSubUsers(); // Recargar la lista después de eliminar
            });
        });
    } catch (error) {
        console.error('Error al cargar sub-usuarios:', error);
    }
}


   // Eliminar un sub-usuario por su email
async function deleteSubUser(subUserEmail) {
    try {
        const response = await fetch(`/api/sub-users/${subUserEmail}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (response.ok) {
            alert('Sub-usuario eliminado');
        } else {
            alert('Error al eliminar el sub-usuario');
        }
    } catch (error) {
        console.error('Error al eliminar el sub-usuario:', error);
    }
}

    // Cargar la lista de sub-usuarios al iniciar
    loadSubUsers();
}
