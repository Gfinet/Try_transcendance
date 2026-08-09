const mieleInfo = {
	ident: {
		deviceIdentLabel: {
			fabIndex: "44",
			fabNumber: "000185936843",
			matNumber: "11367880",
			swids: ["5648", "20456", "25213", "25191", "25304", "25205", "25312", "25319"],
			techType: "WSI863"
		},
		deviceName: "",
		protocolVersion: 4,
		type: {
			key_localized: "Type d'appareil",
			value_localized: "Lave-linge",
			value_raw: 1
		},
		xkmIdentLabel: {
			releaseVersion: "08.37",
			techType: "EK057"
		}
	},
	programs : [
		{programId: 146, program: 'QuickPowerWash'},
		{programId: 123, program: 'Foncés / Jeans'},
		{programId: 190, program: 'ECO 40-60 '},
		{programId: 27, program: 'Imperméabilisation'},
		{programId: 23, program: 'Chemises'},
		{programId: 9, program: 'Soie '},
		{programId: 8, program: 'Laine '},
		{programId: 4, program: 'Fin'},
		{programId: 3, program: 'Synthétique'},
		{programId: 1, program: 'Coton'},
		{programId: 69, program: 'Coton hygiène'},
		{programId: 37, program: 'Textiles outdoor'},
		{programId: 122, program: 'Express 20'},
		{programId: 29, program: 'Textiles sport'},
		{programId: 31, program: 'Automatic plus'},
		{programId: 39, program: 'Oreillers'},
		{programId: 22, program: 'Voilages'},
		{programId: 129, program: 'Textiles matelassés'},
		{programId: 53, program: 'Vêtements neufs'},
		{programId: 95, program: 'Couette plumes'},
		{programId: 52, program: 'Rinçage/amidonnage'},
		{programId: 21, program: 'Vidange / essorage'},
		{programId: 91, program: 'Nettoyage machine'}
	],
	state: {
		ProgramID: {
			key_localized: "Nom du programme",
			value_localized: "",
			value_raw: 0
		},
		ambientLight: null,
		batteryLevel: null,
		coreTargetTemperature: [{
			unit: "Celsius",
			value_localized: null,
			value_raw: -32768
		}],
		coreTemperature: [{
			unit: "Celsius",
			value_localized: null,
			value_raw: -32768
		}],
		
		dryingStep: {
			key_localized: "Niveau de séchage",
			value_localized: "",
			value_raw: null
		},
		ecoFeedback: null,
		elapsedTime: [0, 0],
		light: null,
		plateStep: [],
		programPhase: {
			key_localized: "Phase du programme",
			value_localized: "",
			value_raw: 0
		},
		programType: {
			key_localized: "Type de programme",
			value_localized: "",
			value_raw: 0
		},
		remainingTime: [0,0],
		remoteEnable: {
			fullRemoteControl: true,
			mobileStart: false,
			smartGrid: false
		},
		signalDoor: false,
		signalFailure: false,
		signalInfo: false,
		spinningSpeed: {
			key_localized: "Vitesse d'essorage",
			unit: "tr/min",
			value_localized: null,
			value_raw: null
		},
		startTime: [],
		status: {
			key_localized: "statut",
			value_localized: "Arrêt",
			value_raw: 1
		},
		targetTemperature: [
			{
				unit: "Celsius",
				value_localized: null,
				value_raw: -32768,
			},
			{
				unit: "Celsius",
				value_localized: null,
				value_raw: -32768,
			},
			{
				unit: "Celsius",
				value_localized: null,
				value_raw: -32768
			}
		],
		temperature: [],
		ventilationStep: {
			key_localized: "Niveau du ventilateur",
			value_localized: "",
			value_raw: null,
		}
	}
}