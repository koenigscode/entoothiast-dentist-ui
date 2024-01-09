import * as p from '@clack/prompts';
import color from 'picocolors';
import main from './index.js';
import Table from 'cli-table';

class AdminMenu {
    constructor(api, state) {
        this.api = api;
        this.state = state;
    }

    async showMenu() {
        const adminMenuChoice = await p.select({
            message: 'Choose an option:',
            options: [
                { value: 'addClinic', label: 'Add a new clinic' },
                { value: 'viewClinics', label: 'View all clinics' },
                { value: 'removeClinic', label: 'Remove clinic' },
                { value: 'viewLogs', label: "View logs"},
                { value: 'editClinic', label: "Edit a clinic"}, 
                { value: 'assignDentist', label: 'Assign a dentist to a clinic'},
                { value: 'stats', label: 'See statistics'},
                { value: 'notifs', label: 'See notifications' },
                { value: 'logout', label: 'Log out' },
                { value: 'exit', label: 'Exit' },
            ],
        });

        switch (adminMenuChoice) {
            case 'addClinic':
                p.intro(`${color.bgBlue(color.black(' Create a new clinic '))}`);
                await this.addClinic();
                this.showMenu()
                break;
            case 'viewLogs':
                await this.viewLogs();
                this.showMenu()
                break;
            case 'assignDentist':
                p.intro(`${color.bgBlue(color.black(' Assign a dentist to a clinic '))}`);
                await this.assignDentist();
                this.showMenu()
                break;
            case 'editClinic':
                p.intro(`${color.bgBlue(color.black(' Edit an existing clinic '))}`);
                await this.editClinic();
                this.showMenu()
                break;
            case 'stats':
                p.intro(`${color.bgBlue(color.black(' Statistics '))}`);
                await this.showStats();
                this.showMenu()
                break;
            case 'viewClinics':
                p.intro(`${color.bgBlue(color.black(' View all clinics '))}`);
                await this.viewClinics();
                this.showMenu()
                break;
            case 'removeClinic':
                p.intro(`${color.bgBlue(color.black(' Delete an existing clinic '))}`);
                await this.removeClinic();
                this.showMenu()
                break;
            case 'exit':     
                console.clear();
                p.outro('Thank you for using Entoothiast!');
                setTimeout(() => {
                    process.exit(0);
                }, 1000);
                break;
            case 'logout':
                p.outro('See you soon!');
                main().catch(console.error);
                break;
            default:
                break;
        }
    }

    
    
    async addClinic() {

        p.intro(`${color.bgGreen(color.black(' Create a new clinic '))}`);
        const name = await p.text({
            message: 'Enter the name of the new clinic:',
            placeholder: "NewClinic",
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter a valid username.';
            },
        });
        const regex = /^\d{2}\.\d{6}$/;
        const latitude = await p.text({
            message: 'Enter the latitude of this clinic:',
            placeholder: "23.345678",
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
                if (!regex.test(value.trim())) {
                    return 'Invalid latitude format';
                }
            },
        });
        const longitude = await p.text({
            message: 'Enter the longitude of this clinic:',
            placeholder: "23.456789",
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only longitude.';
                if (!regex.test(value.trim())) {
                    return 'Invalid longitude format';
                }
            },
        });

        var table = new Table({
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            },
            head: [`Patient name`, `Starting time`, 'Ending time', `Confirmed`, `Cancelled`]
        });
    
            try {
                const { status } = await this.api.post(`/clinics`, { name, latitude, longitude})
                if (status === 201) {
                    p.outro('Successfully created a new clinic!');
                } else {
                    console.log("it goes to else")
                    p.outro('This clinic already exists or some fields were left empty.');
                }
            } catch (error) {
                console.log('it goes to catch')
                console.log(error)
                p.outro('This clinic already exists or some fields were left empty.');
            }
        }
        async showStats(){
                try {
                    const {status, data} = await this.api.get(`/statistics/number-searches`)
                        if (status !== 200){
                            console.log("Some error occurred when fetching statistics")
                            return
                        } 
                        p.outro(`${color.bgWhite(color.black(`${data.searches} searches for timeslots took place`))}`)
                    
                } catch(error){
                    console.log(error)
                    console.log("Some error occurred when fetching statistics")
                    return
                }
            
                try {
                    const {status, data} = await this.api.get(`/statistics/timeslots-available`)
                    if (status !== 200){
                            console.log("Some error occurred when fetching statistics")
                            return
                        } 
                        p.outro(`${color.bgWhite(color.black(`${data.timeslots} timeslots are currently available`))}`)
                    
                } catch(error){
                    console.log(error)
                    console.log("Some error occurred when fetching statistics")
                    return
                }
            
                }
                async removeClinic(){
                    await this.viewClinics()
                        var id;
                        p.intro(`${color.bgGreen(color.black(' Delete an existing clinic '))}`);
                        id = await p.text({
                            message: 'Enter the id of a clinic you want to delete:',
                            placeholder: "111",
                            validate: (value) => {
                                if (!value || value.trim().length === 0) {
                                    return 'Please enter a valid ID.';
                                }
                                const parsedValue = parseFloat(value.trim());
                                if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                                    return 'Please enter a valid positive integer ID.';
                                }
                            },
                            },
                        );
                         const deleteClinic = await p.confirm({
                            message: `Are you sure you want to delete clinic with this id ${id}?`,
                          });
                        if (deleteClinic === true){
                            try {
                                const { status } =  await this.api.delete(`/clinics/${id}`)
                                if (status !== 200){
                                    console.log("Something went wrong when deleting the clinic")
                                    return
                                }
                    
                                p.outro("The clinic was successfully deleted!")
                        } catch(error){
                            console.log("An error occurred when deleting this clinic")
                        }
                        }                  
                    }

                    async viewLogs() {
                        try {
                            const { data, status } = await this.api.get(`/logs?limit=100`)
                            if (status !== 200) {
                                console.log("Something went wrong when trying to fetch the logs")
                                return
                            }
                    
                            const logTable = new Table({
                                head: ["Timestamp", "Topic", "Payload"],
                                colWidths: [30, 50, 50]
                            });
                    
                            data.logs.forEach(log => logTable.push([new Date(log.timestamp).toLocaleString(), log.topic, log.payload]))
                            console.log(logTable.toString())
                    
                        } catch (err) {
                            console.log(err)
                            console.log("An error occured when trying to fetch the logs")
                        }
                    
                    }

                    async editClinic() {
                        const clinicTable = await this.viewClinics(false);
                        p.intro(`${color.bgGreen(color.black(' Clinics '))}`);
                        console.log(clinicTable.toString())
                        let name;
                        let latitude;
                        let longitude;
                        let id;
                        const regex = /^\d{2}\.\d{6}$/;
                        p.intro(`${color.bgGreen(color.black(' Edit an existing clinic '))}`);
                        id = await p.text({
                            message: 'Enter the id of a clinic you want to edit:',
                            placeholder: "111",
                            validate: (value) => {
                                if (!value || value.trim().length === 0) {
                                    return 'Please enter a valid ID.';
                                }
                                const parsedValue = parseFloat(value.trim());
                                if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                                    return 'Please enter a valid positive integer ID.';
                                }
                            },
                        });
                        const options = [
                            { value: 'name', label: 'Name' },
                            { value: 'latitude', label: 'Latitude' },
                            { value: 'longitude', label: 'Longitude' },
                        ];
                        
                        const fields = await p.multiselect({
                            message: 'Select what you want to update in a clinic (use spacebar to choose fields).',
                            options: options,
                            required: false,
                        });
                        
                    
                        if (fields) {
                            const selectedValues = fields.map(field => {
                                const selectedOption = options.find(option => option.value === field);
                                return selectedOption ? selectedOption.value : null;
                            });
                    
                        }
                        if (fields.includes('name')){
                            name = await p.text({
                                message: 'Enter the new name for the clinics:',
                                placeholder: "NewName",
                                validate: (value) => {
                                    if (!value || value.trim().length === 0) {
                                        return 'Please enter a valid name.';
                                    }
                                },
                                },
                            );
                        }
                    
                        if (fields.includes('latitude')){
                            latitude = await p.text({
                                message: 'Enter the new latitude for the clinics:',
                                placeholder: "12.123456",
                                validate: (value) => {
                                    if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
                                    if (!regex.test(value.trim())) {
                                        return 'Invalid latitude format';
                                    }
                                },
                            }
                            );
                        }
                    
                        if (fields.includes('longitude')){
                            longitude = await p.text({
                                message: 'Enter the new longitude for the clinics:',
                                placeholder: "12.123456",
                                vvalidate: (value) => {
                                    if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
                                    if (!regex.test(value.trim())) {
                                        return 'Invalid latitude format';
                                    }
                                },
                            }
                            );
                        }
                    
                          try {
                              const {status} = await this.api.patch(`/clinics/${id}`, {name, longitude, latitude})
                              if (status !== 200){
                                console.log("Something went wrong when editing the clinic")
                              } 
                              console.log("The clinic was successfully edited!")
                         } catch(error){
                            console.log("Some error occurred when editing the clinic")
                         }
                    }

                    async viewClinics(printTable = true) {
                        try {
                            const { data, status } = await this.api.get(`/clinics`);
                            if (status !== 200) {
                                console.log("Something went wrong when trying to fetch the clinics");
                                return null; // Return null or handle error appropriately
                            }
                            const clinicTable = new Table({
                                head: ["id", "Name", "Latitude", "Longitude"],
                            });
                    
                            data.clinics.forEach(clinic => clinicTable.push([clinic.id, clinic.name, clinic.latitude, clinic.longitude]));
                            if (printTable) {
                                p.intro(`${color.bgBlue(color.bgMagenta(' Clinics '))}`);
                                console.log(clinicTable.toString());
                            }
                    
                            return clinicTable; // Return the clinicTable
                        } catch (error) {
                            console.log(error);
                            console.log("An error occurred when trying to fetch the clinics");
                            return null; // Return null or handle error appropriately
                        }
                    }

                    async assignDentist(){
                        await this.viewClinics()
                        try {
                            let assignedCount = 0;
                            const { data, status } = await this.api.get('/dentists')
                            if (status !== 200){
                                console.log("Something went wrong when trying to fetch the dentists")
                                return
                            }
                            const dentistTable = new Table({
                                head: ["Dentist id", "Name", "Clinic id"],
                            });
                            
                            if (data.dentists.length > 0) {
                                data.dentists.forEach(dentist => {
                                    if (dentist.clinic_id === null){
                                        assignedCount = assignedCount + 1;
                                        dentistTable.push([
                                            dentist.id,
                                            dentist.name,
                                            '' // If clinic_id is null, push an empty string
                                        ]);
                                    } else {
                                        dentistTable.push([
                                            dentist.id,
                                            dentist.name,
                                            dentist.clinic_id
                                        ]);
                                    }
                                });
                            p.intro(`${color.bgBlue(color.bgMagenta(' Dentists '))}`);
                            console.log(dentistTable.toString())
                            if (assignedCount > 0){
                                console.log(`${assignedCount} dentists are not assigned to any clinic.`)
                                const assign = await p.confirm({
                                    message: 'Would you like to assign a dentist to a clinic?',
                                  });
                                if (assign === false){
                                    await showAdminMenu()
                                } else if (assign === true){
                                    const dentist = await p.text({
                                        message: 'Enter the id of a dentist whom you want to assign to a clinic:',
                                        placeholder: "111",
                                        validate: (value) => {
                                            if (!value || value.trim().length === 0) {
                                                return 'Please enter a valid ID.';
                                            }
                                            const parsedValue = parseFloat(value.trim());
                                            if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                                                return 'Please enter a valid positive integer ID.';
                                            }
                                        },
                                        },
                                    );
                                    const clinic = await p.text({
                                        message: 'Enter the id of a clinic to which you want to assign this dentist:',
                                        placeholder: "111",
                                        validate: (value) => {
                                            if (!value || value.trim().length === 0) {
                                                return 'Please enter a valid ID.';
                                            }
                                            const parsedValue = parseFloat(value.trim());
                                            if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                                                return 'Please enter a valid positive integer ID.';
                                            }
                                        },
                                        },
                                    );
                                    console.log(dentist)
                                    console.log(clinic)
                                    try{
                                        const { status } = await this.api.patch(`/dentists/${dentist}`, {clinic})
                                        if (status !== 200){
                                            console.log("Some error occurred when assigning dentist to a clinic")
                                            return
                                        }
                                        console.log("Dentist successfully assigned to a clinic!")
                                    } catch (error){
                                        console.log("Some error occurred when trying to assign a dentist to a clinic", error)
                                    }
                                }
                            }
                            
                        } 
                    } catch (error){
                        console.log("Some error occurred when trying to fetch dentists")
                    }
                    }
                    
                    
                    


    
}

export default AdminMenu;