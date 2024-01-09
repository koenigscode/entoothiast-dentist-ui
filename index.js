// import * as p from '@clack/prompts';
// import { setTimeout } from 'node:timers/promises';





// let confirmed_count = 0;

// async function getAppointments(){
//     try {
//         const { status, data } = await api.get(`/appointments`);

//         if (status === 200) {
//             if (data.appointments.length > 0) {
//                 data.appointments.forEach(appointment => {
//                     const startTime = new Date(appointment.start_time).toLocaleString();
//                     const endTime = new Date(appointment.end_time).toLocaleString();
//                     if (appointment.confirmed === false){
//                         confirmed_count = confirmed_count + 1;
//                     }
//                     table.push([
//                         appointment.patient_name,
//                         startTime,
//                         endTime,
//                         appointment.confirmed ? 'Yes' : 'No',
//                         appointment.cancelled ? 'Yes' : 'No'
//                     ]);
//                 });
//                 console.log(table.toString())}
//             }
//         } catch (error){
//             p.outro("Something went wrong when fetching your appointments")
//         }
// }





// async function getAllClinicsToRemove() {
//     try {
//         const { data, status } =  await api.get(`/clinics`)
//         if (status !== 200){
//             console.log("Something went wrong when trying to fetch the clinics")
//             return
//         }
//         const clinicTable = new Table({
//             head: ["id", "Name", "Latitude", "Longitude"],
//         });

//         data.clinics.forEach(clinic => clinicTable.push([clinic.id, clinic.name, clinic.latitude, clinic.longitude]))
//         console.log(clinicTable.toString())
//         await removeClinic()
//     } catch (error) {
//         console.log(error)
//         console.log("An error occurred when trying to fetch the clinics")
//     }
// }





    

        





// 
    
       




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

// async function viewTimeslots(){
//     try {
//         const { status, data } = await api.get(`/dentists/${state.userId}/timeslots`);

//         if (status === 200) {
//             if (data && data.timeslots && data.timeslots.length > 0) {
//                 const timeslotTable = new Table({
//                     head: ["Timeslot ID", "Start Time", "End Time"],
//                     colWidths: [15, 30, 30],
//                 });

//                 data.timeslots.forEach((timeslot) => {
//                     const startTime = new Date(timeslot.start_time).toLocaleString();
//                     const endTime = new Date(timeslot.end_time).toLocaleString();

//                     timeslotTable.push([timeslot.id, startTime, endTime]);
//                 });

//                 console.log(timeslotTable.toString());
//             } else {
//                 console.log('No timeslots found for the dentist.');
//             }
//         } else {
//             console.log('Failed to retrieve timeslots.');
//         }
//     } catch (error) {
//         console.error('Error occurred while fetching timeslots:', error.message);
//     }   
// }


// async function deleteTimeslot(){
//     const id = await p.text({
//         message: 'Enter the id of a timeslot that you want to delete',
//         validate: (value) => {
//             if (!value) return 'Please enter an id';
//         },
//     })
//     try {
//         const {status} = await api.delete(`/dentists/timeslots/${id}`)
//         if (status !== 200){
//             console.log("Some error occurred when trying to delete a timeslot")
//             await showMenu()
//         }
//         console.log("Successfully deleted a timeslot!")
//         await showMenu()
//     } catch(error){
//         console.log("Some error occurred when trying to delete a timeslot")
//     }
// }



// async function showMenu() {
//     if (state.userRole === 'admin') {
//         await showAdminMenu();
//     } else {
//     const menuChoice = await p.select({
//         message: 'Choose an option:',
//         options: [
//             { value: 'update', label: 'Update account details' },
//             { value: 'view', label: 'View upcoming appointments' },
//             { value: 'publish', label: 'Publish a new timeslot' },
//             { value: 'viewTimeslots', label: 'View your timeslots' },
//             { value: 'cancel', label: 'Cancel an appointment' },
//             { value: 'delete', label: 'Delete a published timeslot' },
//             { value: 'notifs', label:`View ${unreadNotifications} unread notifications`},
//             { value: 'logout', label: 'Log out' },
//             { value: 'exit', label: 'Exit' },
//         ],
//     });

//     switch (menuChoice) {
//         case 'update':
//             p.intro(`${color.bgYellow(color.black(' Update Account Details '))}`);
            
//             const fieldToUpdate = await p.select({
//                 message: 'Which field do you want to update?',
//                 options: [
//                     { value: 'username', label: 'Username' },
//                     { value: 'name', label: 'Name' },
//                 ],
//             });
        
//             const newValue = await p.text({
//                 message: `Enter the new value for ${fieldToUpdate}:`,
//                 validate: (value) => {
//                     if (!value || value.trim().length === 0) return `Please enter a valid ${fieldToUpdate}.`;
//                 },
//             });

//             const newData = {
//                 [fieldToUpdate]: newValue,
//             };

//             try {
//                 const { status, data } = await api.patch(`/users/${state.userId}`, newData);

//                 if (status === 200) {
//                     p.outro('Account details updated successfully!');
//                 } else {
//                     p.outro('Failed to update account details.');
//                 }
//             } catch (error) {
//                 console.error('Failed to update account details:', error.message);
//             }
//             await showMenu();
//             break;
//         case 'view':
//             p.intro(`${color.bgBlue(color.black(' View upcoming appointments '))}`);
//             try {
//                 const { status, data } = await api.get(`/appointments`);

//                 if (status === 200) {
//                     if (data.appointments.length > 0) {
//                         data.appointments.forEach(appointment => {
//                             const startTime = new Date(appointment.start_time).toLocaleString();
//                             const endTime = new Date(appointment.end_time).toLocaleString();
//                             if (appointment.confirmed === false){
//                                 confirmed_count = confirmed_count + 1;
//                             }
//                             table.push([
//                                 appointment.patient_name,
//                                 startTime,
//                                 endTime,
//                                 appointment.confirmed ? 'Yes' : 'No',
//                                 appointment.cancelled ? 'Yes' : 'No'
//                             ]);
//                         });
//                         console.log(table.toString())
//                         table.length = 0
//                         if (confirmed_count === 0){
//                             console.log("All your appointments are confirmed")
//                         } else { 
//                             console.log(`You still haven't confirmed ${confirmed_count} appointments. `)
//                             const edit = await p.confirm({
//                                 message: 'Would you like to confirm your upcoming appointments?',
//                               });
//                             if (edit === false){
//                                 await showMenu()
//                                 break
//                             }
//                             else if (edit === true){
//                                 const id = await p.text({
//                                     message: 'Enter the id of an appointment that you want to confirm',
//                                     validate: (value) => {
//                                         if (!value) return 'Please enter an id';
//                                     },
//                                 });
    
//                                 try{
//                                     const confirmed = true
//                                     const { status, data } = await api.patch(`/appointments/${id}`, {confirmed});
//                                     if (status === 200){
//                                         p.outro(`Appointment ${id} confirmed`);
//                                     } 
//                                 } catch (error){
//                                     p.outro("An error occurred when confirming an appointment")
//                                 }
//                             }
//                         }
//                     } else {
//                         p.outro('No upcoming appointments found.');
//                     }
//                 } else {
//                     p.outro('Failed to retrieve appointments.');
//                 }
//             } catch (error) {
//                 console.log(error);
//                 p.outro('Error occurred while fetching appointments.');
//             }
//             await showMenu();
//             break;
//         case 'publish':
//             p.intro(`${color.bgBlue(color.black(' Publish a new available timeslot '))}`);
//             const date = await p.text({
//                 placeholder: '2023-11-21',
//                 message: 'Enter the date (YYYY-MM-DD):',
//                 validate: (value) => {
//                     if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Please enter a valid date in the format YYYY-MM-DD.';
//                 },
//             });
//             const start = await p.text({
//                 placeholder: '14:00:00',
//                 message: 'Enter the starting time (HH:MM:SS) of a new timeslot:',
//                 validate: (value) => {
//                     if (!value.match(/^\d{2}:\d{2}:\d{2}$/i)) return 'Please enter a valid time in the format HH:MM:SS.';
//                 },
//             });
//             const end = await p.text({
//                 placeholder: '15:00:00',
//                 message: 'Enter the ending time (HH:MM:SS) of a new timeslot:',
//                 validate: (value) => {
//                     if (!value.match(/^\d{2}:\d{2}:\d{2}$/i)) return 'Please enter a valid time in the format HH:MM:SS.';
//                 },
//             });
//             try {
//                 //get the times in the needed format "2023-12-05 13:00:00"
//                 const start_time = date + " " + start
//                 const end_time = date + " " + end
//                 const { status } = await api.post(`/dentists/timeslots`, { start_time, end_time })
//                 if (status === 201) {
//                     p.outro(`Timeslot published for ${date} starting at ${start} until ${end}`);
//                 } else {
//                     p.outro('All fields have to be filled.');
//                 }
//             } catch (error) {
//                 console.log(error)
//                 p.outro('All fields have to be filled');
//             }
//             await showMenu();
//             break;

//             case 'viewTimeslots':
//                 p.intro(`${color.bgBlue(color.black(' View Timeslots '))}`);
//                 await viewTimeslots()
//                 await showMenu();
//                 break;    
                     
        
//         case 'cancel':
//             p.intro(`${color.bgBlue(color.black(' Cancel an appointment '))}`);
//             // Handle cancel an appointment
//                 try {
//                     const { status, data } = await api.get(`/appointments`);
            
//                     if (status === 200) {
//                         if (data.appointments.length > 0) {
//                             const appointmentTable = new Table({
//                                 head: ["Appointment id", "Patient name", "Starting time", "Ending time", "Confirmed", "Cancelled"],
//                             });
            
//                             data.appointments.forEach(appointment => {
//                                 const startTime = new Date(appointment.start_time).toLocaleString();
//                                 const endTime = new Date(appointment.end_time).toLocaleString();
//                                 if (appointment.confirmed === false){
//                                     confirmed_count = confirmed_count + 1;
//                                 }
//                                 appointmentTable.push([
//                                     appointment.appointment_id,
//                                     appointment.patient_name,
//                                     startTime,
//                                     endTime,
//                                     appointment.confirmed ? 'Yes' : 'No',
//                                     appointment.cancelled ? 'Yes' : 'No'
//                                 ]);
//                             });
            
//                         console.log(appointmentTable.toString())
//                         appointmentTable.length = 0
//                             const cancel = await p.confirm({
//                                 message: 'Would you like to cancel any of your upcoming appointments?',
//                               });
//                             if (cancel === false){
//                                 await showMenu()
//                                 break
//                             }
//                             else if (cancel === true){
//                                 const id = await p.text({
//                                     message: 'Enter the id of an appointment that you want to cancel',
//                                     validate: (value) => {
//                                         if (!value) return 'Please enter an id';
//                                     },
//                                 });
    
//                                 try{
//                                     const cancelled = true
//                                     const { status, data } = await api.patch(`/appointments/${id}`, {cancelled});
//                                     if (status === 200){
//                                         p.outro(`Appointment ${id} cancelled`);
//                                         await showMenu()
//                                     } 
//                                 } catch (error){
//                                     p.outro("An error occurred when cancelling an appointment")
//                                 }
//                             }
//                     } else {
//                         p.outro('No upcoming appointments found.');
//                     }
//                 } else {
//                     p.outro('Failed to retrieve appointments.');
//                 }
//             } catch (error) {
//                 console.log(error);
//                 p.outro('Error occurred while fetching appointments.');
//             }
//             break;
//         case 'delete':
//             p.intro(`${color.bgBlue(color.black(' Delete an appointment '))}`);
//             await viewTimeslots()
//             const deletion = await p.confirm({
//                 message: 'Would you like to delete any of your published timeslots?',
//               });
//             if (deletion === false){
//                 await showMenu()
//                 break
//             }
//             else if (deletion === true){
//                 await deleteTimeslot()
//             }
//             break;
//         case 'logout':
//             p.outro('See you soon!');
//             main().catch(console.error);
//             break;
//         case 'exit':
//             console.clear();
//             p.outro('Thank you for using Entoothiast!');
//             setTimeout(1000);
//             process.exit(0);
//             break;
//         default:
//             break;
//     }
// }
// }

// main().catch(console.error);






import AdminMenu from './AdminMenu.js'; 
import axios from "axios";
import * as p from '@clack/prompts';
import color from 'picocolors';
import 'dotenv/config'

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
                    await showMenu();
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