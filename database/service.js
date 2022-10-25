const { getAuth } = require("firebase/auth");

const { fapp } = require('./firebaseconf');
const { addService, getServices, getService, deleteService, updateService, getCategorieById, getAvis, deleteAvis } = require("./requeteKnex");
const { get, child, ref, getDatabase } = require("firebase/database");


exports.createService = async(req,res) =>{
    const auth = getAuth(fapp);
    const user = auth.currentUser;

    if (user !== null) {
        const { Id_categorie, nomService, description, prix, photoCouverture } = req.body;
        try {
            if (Id_categorie === undefined && nomService === undefined)
                return res.status(400).json({ success : false, message: 'paramètre manquant'});

            const DataToSend = {
                Id_user: user.uid,  
                Id_categorie: Id_categorie,
                nomService: nomService,
                description: description? description : '',
                prix: prix? prix : 0,
                photoCouverture: photoCouverture? photoCouverture : '',
                datePublication: new Date().toLocaleString('fr-FR', 'Canada/Montréal'),
            };
            // ajout de données
            const row = await addService(DataToSend)
            if(row !== []) {
                return res.status(201).json({ success : true, message: 'le service a été ajouté' });
            } else {
                return res.status(500).json({ success: false, message: "une erreur est survenue lors de l'ajout" });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: error });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Vous n\'êtes pas connecté' });
    }
};


exports.updateService = async(req,res) =>{
    const auth = getAuth(fapp);
    const user = auth.currentUser;
    let id_user = '';

    const id = req.params.idService;
    const data = await getService(id);

    if(data.length === 0) {
        res.status(404).json({ success: false, message: "aucun service trouvé" });
    } else {
        id_user = data[0].id_user;
    }

    if (user !== null && user.uid === id_user) {
        const { Id_categorie, nomService, description, prix, photoCouverture } = req.body;

        try {
            if (Id_categorie === undefined || nomService === undefined) {
                return res.status(400).json({ success : false, message: 'paramètre manquant'});
            }

            const categorie = await getCategorieById(Id_categorie);

            if(categorie.length === 0) {
                return res.status(404).json({ success: false, message: "aucune categorie trouvé, veuillez la verifier" });
            }
            const DataToSend = {
                id_categorie: Id_categorie,
                nomService: nomService,
                description: description? description : '',
                prix: prix? prix : 0,
                photoCouverture: photoCouverture? photoCouverture : '',
                dateModification: new Date().toLocaleString('fr-FR', 'Canada/Montréal'),
            };
            // updte de données
            await updateService(id, DataToSend)
            return res.status(201).json({ success : true, message: 'le service a été mis à jour' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Vous n\'êtes pas connecté' });
    }
};

exports.deleteService = async(req,res) =>{
    const auth = getAuth(fapp);
    const user = auth.currentUser;
    const id = req.params.idService;
    let id_user = '';

    // get id_user of the service
    const services = await getService(id);
    if(services.length !== 0) {
        id_user = services[0].id_user;
    } else {
        res.status(404).json({ success: false, message: "aucun service trouvé" });
    }
        
    if(user !== null && user.uid === id_user) {
        try {
            const delSuccess = await deleteService(id);
            if(delSuccess) {
                res.status(201).json({ success : true, message: 'le service a été supprimé' });
            } else {
                res.status(500).json({ success: false, message: "une erreur est survenue lors de la suppression" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "une erreur est survenue lors de la suppression" });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Vous n\'êtes pas connecté' });
    }
}

exports.getService = async(req,res) =>{
    const id = req.params.idService;
    const database = ref(getDatabase());

    try {
        const services = await getService(id);
        if(services.length !== 0) {
            let dataDisplay = [];
            services.forEach( async (service) => {
                const avis = await getAvis(service.id_service);
                let avisToDisplay = [];

                avis.forEach( (a) => {
                    get(child(database, `users/${a.id_client}`)).then((data) => {
                        if (data.exists()) {
                            const snapshot = data.val();
                            avisToDisplay.push({
                                id_avis: a.id_avis,                                
                                client: {
                                    id_client: a.id_client,
                                    nomClient: snapshot.nom_user,
                                    prenomClient: snapshot.prenom_user,
                                    photoProfil: snapshot.photoProfil? snapshot.photoProfil : 'aucune photo',
                                },
                                note: a.note,
                                commentaire: a.commentaire,
                                datePublication: a.datePublication,
                            })
                        } 
                        else {
                            avisToDisplay.push({ message: 'aucun avis trouvé' });
                        }
                    })
                })
                
                get(child(database, `users/${service.id_user}`)).then(async (data) => {
                    if (data.exists()) {
                        const snapshot = data.val();

                            dataDisplay = {
                                vendeur : {
                                    Id_user: service.id_user,
                                    nom_user: snapshot.nom_user,
                                    prenom_user: snapshot.prenom_user,
                                    photoProfil: snapshot.photoProfil
                                },
                                categorie: {
                                    Id_categorie: service.id_categorie[0],
                                    nomCategorie: service.nom_categorie,
                                },
                                Id_service: service.id_service,
                                nomService: service.nomService,
                                prix: service.prix,
                                description: service.description,
                                photoCouverture: service.photoCouverture,
                                datePublication: service.datePublication,
                                dateModification: service.dateModification,
                                avis: avisToDisplay
                            }
                            res.status(200).json( dataDisplay );
                        
                    } else {
                        res.status(404).json({ success: false, message: "aucun utilisateur trouvé pour ce service" });
                    }
                }).catch(() => {
                    res.status(500).json({ success: false, message: "une erreur est survenue lors de la récupération des services" });
                });
            });
        } else {
            res.status(404).json({ success: false, message: "aucun service trouvé" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "une erreur lors de la récupération des services" });
    }
}



exports.getAllServices = async(req,res) =>{
    try {
        const services = await getServices();
        if(services !== []) {
            let data = [];
            services.forEach((service) => {
                dataDisplay = {
                    Id_service: service.id_service,
                    nomService: service.nomService,
                    prix: service.prix,
                    photoCouverture: service.photoCouverture,
                    datePublication: service.datePublication,
                }
                data.push(dataDisplay);
            });
            return res.status(200).json( data );
        } else {
            return res.status(404).json({ success: false, message: "aucun service trouvé" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "une erreur est survenue lors de la récupération des services" });
    }
}