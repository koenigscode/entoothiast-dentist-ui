import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';
import 'dotenv/config'
import axios from "axios";

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 1000,
});

api.interceptors.request.use(config => {
    if (state.token !== undefined)
        config.headers.Authorization = `Bearer ${state.token}`;
    return config;
});

const state = {}

async function main() {
    console.clear();
    await setTimeout(1000);

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
                if (value.length < 5) return 'Password should have at least 5 characters.';
            },
        });

        try {
            const { data, status } = await api.post("/users/login", { username, password })
            if (status === 200) {
                state.token = data.token;
                p.outro('Logged in successfully!');
                loggedIn = true
                await showMenu();
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
            if (value.length < 5) return 'Password should have at least 5 characters.';
        },
    });

    try {
        const role = 'dentist'
        const {status } = await api.post("/users/register", { username, password, name, role })
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

async function showMenu() {
    const menuChoice = await p.select({
        message: 'Choose an option:',
        options: [
            { value: 'view', label: 'View upcoming appointments' },
            { value: 'publish', label: 'Publish a new timeslot' },
            { value: 'cancel', label: 'Cancel an appointment' },
            { value: 'delete', label: 'Delete a published timeslot' },
            { value: 'logout', label: 'Log out' },
            { value: 'exit', label: 'Exit' },
        ],
    });

    switch (menuChoice) {
        case 'view':
            p.intro(`${color.bgBlue(color.black(' View upcoming appointments '))}`);
            // Handle view upcoming appointments
            break;
        case 'publish':
            p.intro(`${color.bgBlue(color.black(' Publish a new available timeslot '))}`);
            const date = await p.text({
                placeholder: '2023-11-21',
                message: 'Enter the date (YYYY-MM-DD):',
                validate: (value) => {
                    if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Please enter a valid date in the format YYYY-MM-DD.';
                },
            });
            const start = await p.text({
                placeholder: '14:00:00',
                message: 'Enter the starting time (HH:MM:SS) of a new timeslot:',
                validate: (value) => {
                    //if (!value.match(/^\d{2}:\d{2}$/i)) return 'Please enter a valid time in the format HH:MM AM/PM.';
                },
            });
            const end = await p.text({
                placeholder: '15:00:00',
                message: 'Enter the ending time (HH:MM:SS) of a new timeslot:',
                validate: (value) => {
                    //if (!value.match(/^\d{2}:\d{2}$/)) return 'Please enter a valid time in the format HH:MM AM/PM.';
                },
            });
            try {
                //get dentistid
                //get the times in the needed format "2023-12-05 13:00:00"
                const start_time = date + " " + start
                console.log(start_time)
                const end_time = date + " " + end
                console.log(end_time)
                const { status } = await api.post("/dentists/dentistId/timeslots", { start_time, end_time })
                if (status === 201) {
                    p.outro(`Timeslot published for ${date} at ${time}`);
                } else {
                    p.outro('All fields have to be filled.');
                }
            } catch (error) {
                p.outro('All fields have to be filled');
            }
            await showMenu();
            break;
        case 'cancel':
            p.intro(`${color.bgBlue(color.black(' Cancel an appointment '))}`);
            // Handle cancel an appointment
            break;
        case 'delete':
            p.intro(`${color.bgBlue(color.black(' Delete an appointment '))}`);
            // Handle delete a published timeslot
            break;
        case 'logout':
            p.outro('See you soon!');
            main().catch(console.error);
            break;
        case 'exit':
            console.clear();
            p.outro('Thank you for using Entoothiast!');
            setTimeout(1000);
            process.exit(0);
            break;
        default:
            break;
    }
}

main().catch(console.error);






