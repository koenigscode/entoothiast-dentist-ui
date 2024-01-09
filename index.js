
    
       




// async function getNofifs(){
//     try {
//         const { status, data } = await api.get(`/users/${state.userId}/notifications`);
//         if (status !== 200) {
//             console.log("An error occurred when fetching notifications");
//             return 0;
//         }
//         return data.notifications.length;
//     } catch(error){
//         console.log(error)
//     }
// }

// let unreadNotifications = await getNofifs()










import AdminMenu from './AdminMenu.js'; 
import axios from "axios";
import * as p from '@clack/prompts';
import color from 'picocolors';
import 'dotenv/config'
import DentistMenu from './DentistMenu.js';

const state = {}

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 1000,
});

api.interceptors.request.use(config => {
    if (state && state.token !== undefined) {
        config.headers.Authorization = `Bearer ${state.token}`;
    }
    return config;
});



async function main() {
    console.clear();

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });

    p.intro(`${color.bgCyan(color.black(' Entoothiast '))}`);

    const choice = await p.select({
        message: `What would you like to do?`,
        options: [
            { value: 'login', label: 'Login', hint: 'Do you already have an account?' },
            { value: 'register', label: 'Register' },
        ],
    });

    if (choice === 'login') {
        await loginUser();
    } else if (choice === 'register') {
        await registerUser();
    }
}

async function loginUser() {
    let loggedIn = false

    while (!loggedIn) {
        p.intro(`${color.bgGreen(color.black(' Login '))}`);

        const username = await p.text({
            message: 'Enter your username:',
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter a valid username.';
            },
        });

        const password = await p.password({
            message: 'Enter your password:',
            validate: (value) => {
                if (!value) return 'Please enter a password.';
                if (value.length < 4) return 'Password should have at least 4 characters.';
            },
        });

        try {
            const { data, status } = await api.post("/users/login", { username, password })
            if (status === 200) {
                state.token = data.token;
                state.userId = data.user.id;
                state.userRole = data.user.role;
                p.outro('Logged in successfully!');
                loggedIn = true
             
                if (state.userRole === 'admin') {
                    
                    const adminMenu = new AdminMenu(api); 

                    async function startAdminMenu() {
                        try {
                            await adminMenu.showMenu();
                        } catch (error) {
                            console.error('Error in admin menu:', error);
                        }
                    }

startAdminMenu().catch(console.error);
                } else {
                    const denistMenu = new DentistMenu(api, state); 

                    async function startDentistMenu() {
                        try {
                            await denistMenu.showMenu();
                        } catch (error) {
                            console.error('Error in dentist menu:', error);
                        }
                    }

startDentistMenu().catch(console.error);
                }
            } else {
                p.outro('Invalid username or password! Try again.');
            }
        } catch (error) {
            p.outro('Invalid username or password! Try again.');
        }

    }

}

async function registerUser() {
    let registered = false

    while (!registered) {
    p.intro(`${color.bgGreen(color.black(' Register '))}`);
    const name = await p.text({
        message: 'Enter your name:',
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter a valid username.';
        },
    });
    const username = await p.text({
        message: 'Enter your new username:',
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter a valid username.';
        },
    });
    const password = await p.password({
        message: 'Enter your new password:',
        validate: (value) => {
            if (!value) return 'Please enter a password.';
            if (value.length < 4) return 'Password should have at least 4 characters.';
        },
    });

        try {
            const role = 'dentist'
            const { status } = await api.post("/users/register", { username, password, name, role })
            if (status === 201) {
                p.outro('Registered successfully! You can login now');
                await loginUser()
            } else {
                p.outro('This user already exists or some fields are left empty.');
            }
        } catch (error) {
            p.outro('This user already exists or some fields are left empty');
        }
    }
}

main().catch(console.error);


export default main