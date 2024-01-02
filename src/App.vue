<template>
    <div class="page-container">
        <div class="sflight-container">
            <h2>Welcome Flight Search App</h2>
            <form @submit.prevent="searchFlights">
                <div class="form-group">
                    <div class="switch-field">
                        <input type="radio" id="radio-one" name="switch-one" v-model="selectedOption" :value="0" checked />
                        <label for="radio-one">One - Way</label>
                        <input type="radio" id="radio-two" name="switch-one" v-model="selectedOption" :value="1" />
                        <label for="radio-two">Round Trip</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Departure Airport</label>
                    <div class="autocomplete-container">
                        <input type="text" v-model="textfromInput" @input="onfromInput" required>
                        <ul v-if="fromsuggestions.length > 0">
                            <li v-for="(suggestion, index) in fromsuggestions" :key="index" @click="selectfromSuggestion(suggestion)">
                                {{ `${suggestion.city} - ${suggestion.name}`  }}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="form-group">
                    <label>Arrival Airport</label>
                    <div class="autocomplete-container">
                        <input type="text" v-model="texttoInput" @input="ontoInput" required>
                        <ul v-if="tosuggestions.length > 0">
                            <li v-for="(suggestion, index) in tosuggestions" :key="index" @click="selecttoSuggestion(suggestion)">
                                {{ `${suggestion.city} - ${suggestion.name}` }}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="form-group">
                    <label>Departure Date</label>
                    <input type="date" v-model="dateDeparture" required>
                </div>
                <div class="form-group">
                    <label>Arrival Date</label>
                    <input type="date" v-model="dateReturn" required :disabled="selectedOption !== 1">
                </div>

                <button type="submit">Search</button>
                <div v-if="loading" class="loading-overlay">
                    Loading...
                </div>
            </form>
        </div>
        <div class="mflight-container" v-if="matchingOutboundFlights.length > 0 && selectedOption == 0 && checkTable == 0">
            <h2>The Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingOutboundFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
        </div>
        <div class="mflight-container" v-if="selectedOption == 0 && checkTable == 1">
            <h2>The Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingOutboundFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
        </div>

        <div class="mflight-container" v-if="selectedOption == 1 && (matchingOutboundFlights.length > 0 || matchingReturnFlights.length > 0)">
            <h2>The Outbound Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingOutboundFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
            <br />
            <h2>The Return Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingReturnFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
        </div>
        <div class="mflight-container" v-if="selectedOption == 1 && checkTable == 1">
            <h2>The Outbound Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingOutboundFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
            <br />
            <h2>The Return Flights</h2>
            <v-data-table v-model:page="page"
                          :headers="headers"
                          :items="matchingReturnFlights"
                          items-per-page="10"
                          :hide-default-footer="true"
                          class="elevation-1"
                          fixed-header>
                <template v-slot:bottom>
                    <div class="text-center pt-2">
                        <v-pagination v-model="page"
                                      :length="pageCount"></v-pagination>
                    </div>
                </template>
            </v-data-table>
        </div>
    </div>

    </template>

    <script>
        import axios from 'axios';

        export default {
            data() {
                return {
                    headers: [
                        {
                            title: "Departure Airport",
                            align: 'start',
                            key: "departureAirport",
                            sortable: false,
                        },
                        {
                            title: "Departure City",
                            align: 'start',
                            key: "departureCity",
                            sortable: false,
                        },
                        {
                            title: "Arrival Airport",
                            align: 'start',
                            key: "arrivalAirport",
                            sortable: false,
                        },
                        {
                            title: "Arrival City",
                            align: 'start',
                            key: "arrivalCity",
                            sortable: false,
                        },
                        {
                            title: "Departure Date",
                            align: 'start',
                            key: "departureDate",
                            sortable: false,
                        },
                        {
                            title: "Departure Time",
                            align: 'start',
                            key: "departureTime"
                        },
                        {
                            title: "Duration",
                            align: 'start',
                            key: "duration"
                        },
                        {
                            title: "Airline",
                            align: 'start',
                            key: "airline",
                            sortable: false,
                        },
                        {
                            title: "Price",
                            align: 'start',
                            key: "price"
                        }
                    ],
                    loading: false,
                    page: 1,
                    departureCity: "",
                    selectedOption: 0,
                    dateDeparture: "",
                    dateReturn: "",
                    textfromInput: "",
                    fromsuggestions: [],
                    texttoInput: "",
                    tosuggestions: [],
                    airports: [],
                    flights: [],
                    matchingOutboundFlights: [],
                    matchingReturnFlights: [],
                    checkTable: 0,

                    departureCode: "",
                    arrivalCode: "",
                };
            },
            computed: {
                pageCount() {
                    return Math.ceil(this.matchingOutboundFlights.length / this.itemsPerPage)
                },
            },
            mounted() {
                document.addEventListener("click", this.closeSuggestionsOnOutsideClick);
                this.fetchAirports();
                this.fetchFlights();
            },

            unmounted() {
                document.removeEventListener("click", this.closeSuggestionsOnOutsideClick);

            },
            methods: {
                async fetchAirports() {
                    try {
                        const response = await axios.get('http://localhost:3000/airports');
                        this.airports = response.data;
                    } catch (error) {
                        console.error('Error fetching vehicles:', error);
                    }
                },
                async fetchFlights() {
                    try {
                        const response = await axios.get('http://localhost:4000/flights');
                        this.flights = response.data;
                    } catch (error) {
                        console.error('Error fetching vehicles:', error);
                    }
                },
                closeSuggestionsOnOutsideClick(event) {
                    const isClickInsideAutocomplete =
                        this.$refs.autocompleteContainer && this.$refs.autocompleteContainer.contains(event.target);

                    const isClickInsideTextfromInput = this.$refs.textfromInput && this.$refs.textfromInput.contains(event.target);

                    const isClickInsideTexttoInput = this.$refs.texttoInput && this.$refs.texttoInput.contains(event.target);

                    if (!isClickInsideAutocomplete && !isClickInsideTextfromInput) {
                        this.fromsuggestions = [];
                    }

                    if (!isClickInsideAutocomplete && !isClickInsideTexttoInput) {
                        this.tosuggestions = [];
                    }
                },

                onfromInput() {
                    this.fromsuggestions = this.airports.filter(item =>
                        item.city.toLowerCase().startsWith(this.textfromInput.toLowerCase()) ||
                        item.name.toLowerCase().startsWith(this.textfromInput.toLowerCase()));
                },
                selectfromSuggestion(suggestion) {
                    this.textfromInput = suggestion.city + '-' + suggestion.name;
                    this.departureCode = suggestion.code;


                    this.fromsuggestions = [];
                },
                ontoInput() {
                    this.tosuggestions = this.airports.filter(item =>
                        item.city.toLowerCase().startsWith(this.texttoInput.toLowerCase()) ||
                        item.name.toLowerCase().startsWith(this.texttoInput.toLowerCase()));

                },
                selecttoSuggestion(suggestion) {
                    this.texttoInput = suggestion.city + '-' + suggestion.name;
                    this.arrivalCode = suggestion.code;

                    this.tosuggestions = [];
                },
                searchFlights() {
                    this.loading = true;
                    if (this.selectedOption == 0 && this.departureCode !== ""
                        && this.arrivalCode !== "" && this.dateDeparture !== "") {
                        this.matchingOutboundFlights = this.flights.filter((flight) => {
                            return (
                                flight.departureAirport.toLowerCase().includes(this.departureCode.toLowerCase()) &&
                                flight.arrivalAirport.toLowerCase().includes(this.arrivalCode.toLowerCase()) &&
                                flight.departureDate.includes(this.dateDeparture)
                            );
                        });

                        this.departureCity = this.airports.filter((airport) => {
                            return (
                                airport.code.toLowerCase().includes(this.departureCode.toLowerCase()) 
                            );
                        });

                        this.arrivalCity = this.airports.filter((airport) => {
                            return (
                                airport.code.toLowerCase().includes(this.arrivalCode.toLowerCase())
                            );
                        });

                        for (const item of this.matchingOutboundFlights) {
                            item.departureCity = this.departureCity[0].city;
                            item.arrivalCity = this.arrivalCity[0].city;
                        }
                        
                        if (this.matchingOutboundFlights.length == 0) {
                            this.checkTable = 1;
                        };

                    }
                    if (this.selectedOption == 1 && this.departureCode !== ""
                        && this.arrivalCode !== "" && this.dateDeparture !== ""
                        && this.dateReturn !== "") {
                        this.matchingOutboundFlights = this.flights.filter((flight) => {
                            return (
                                flight.departureAirport.toLowerCase().includes(this.departureCode.toLowerCase()) &&
                                flight.arrivalAirport.toLowerCase().includes(this.arrivalCode.toLowerCase()) &&
                                flight.departureDate === this.dateDeparture
                            );
                        });

                        this.matchingReturnFlights = this.flights.filter((flight) => {
                            return (
                                flight.departureAirport.toLowerCase().includes(this.arrivalCode.toLowerCase()) &&
                                flight.arrivalAirport.toLowerCase().includes(this.departureCode.toLowerCase()) &&
                                flight.departureDate === this.dateReturn
                            );
                        });
                        this.checkTable = 0;
                        this.departureCity = this.airports.filter((airport) => {
                            return (
                                airport.code.toLowerCase().includes(this.departureCode.toLowerCase())
                            );
                        });

                        this.arrivalCity = this.airports.filter((airport) => {
                            return (
                                airport.code.toLowerCase().includes(this.arrivalCode.toLowerCase())
                            );
                        });

                        for (const item of this.matchingOutboundFlights) {
                            item.departureCity = this.departureCity[0].city;
                            item.arrivalCity = this.arrivalCity[0].city;
                        }

                        for (const item of this.matchingReturnFlights) {
                            item.departureCity = this.arrivalCity[0].city;
                            item.arrivalCity = this.departureCity[0].city;
                        }

                        if (this.matchingOutboundFlights.length == 0 || this.matchingReturnFlights.length == 0) {
                            this.checkTable = 1;
                        };
                    }
                    setTimeout(() => {
                        this.loading = false;
                    }, 1000);
                }
            }
        };
    </script>

    <style>
        .page-container {
            display: flex;
            flex-wrap: wrap;
        }

        .sflight-container {
            flex: 1;
            max-width: 33%;
            padding: 20px;
            box-sizing: border-box;
        }

            .sflight-container h2 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }

            .sflight-container form {
                display: flex;
                flex-direction: column;
            }

        .mflight-container {
            flex: 1;
            max-width: 66%;
            padding: 20px;
            box-sizing: border-box;
        }

            .mflight-container h2 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }

        .form-group {
            margin: 10px;
        }

            .form-group label {
                font-size: 16px;
                color: #333;
            }

        .autocomplete-container {
            position: relative;
            width: 100%;
        }

        input[type="date"],
        input[type="text"] {
            width: 100%;
            padding: 12px 20px;
            margin: 8px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }

        .sflight-container ul {
            list-style-type: none;
            width: 100%;
            padding: 0;
            position: absolute;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background-color: #fff;
            z-index: 1;
        }

        .sflight-container li {
            cursor: pointer;
            padding: 12px 20px;
            margin: 0;
            font-size: 16px;
        }

        li:hover {
            background-color: #f0f0f0;
        }

        button {
            background-color: #63C132 !important;
            color: #fff !important;
            border: none;
            padding: 10px;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
        }

            button:hover {
                background-color: #59ad2d !important;
            }


        .switch-field {
            display: flex;
        }

            .switch-field input {
                position: absolute !important;
                clip: rect(0, 0, 0, 0);
                height: 1px;
                width: 1px;
                border: 0;
            }

            .switch-field label {
                width: 100%;
                background-color: #e4e4e4;
                color: white;
                font-size: 14px;
                line-height: 1;
                text-align: center;
                padding: 8px 16px;
                margin-right: -1px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1);
                transition: all 0.1s ease-in-out;
            }

                .switch-field label:hover {
                    cursor: pointer;
                }

            .switch-field input:checked + label {
                background-color: #63C132;
                box-shadow: none;
            }

            .switch-field label:first-of-type {
                border-radius: 4px 0 0 4px;
            }

            .switch-field label:last-of-type {
                border-radius: 0 4px 4px 0;
            }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            z-index: 999;
        }
    </style>
