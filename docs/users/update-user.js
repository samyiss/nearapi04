module.exports = {
    // method of operation
    put: {
      tags: ["Utilisateurs client/employé"], // operation's tag.
      security: [
        {
          bearerAuth: []
        }
      ],
      summary: "Modifie les informations de l'utilisateur dont le IdUser est donné client/employé", // operation's desc.
      operationId: "updateUser", // unique operation id.
      requestBody:  {
        required: true, // Mandatory param
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateUserPayload", // user data model            
            },
          }, 
        },
      },
      // expected responses
      responses: {
        // response code
        201: {
          description: "Les informations de l'utilisateur ont été modifiées", // response desc.
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessage", // User model
              },
            },
          },
        },
        // response code
        401: {
            description: "réponse si l'utilisateur n'est pas connecteé", // response desc.
            content: {
              // content-type
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage", // user data model
                },
              },
            },
          },
          // response code
          404: {
            description: "réponse si l'utilisateur n'est pas trouvé", // response desc.
            content: {
              // content-type
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage", // error data model
                },
              },
            },
          },
        // response code
        400: {
          description: "Une erreur est survenue lors de la modification des informations de l'utilisateur ou manque de données ou Id pas donnée", // response desc.
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessage", // error data model
              },
            },
          },
        },
        // response code
        409: {
          description: "La réponse si l'email que l'utilisateur donne se trouve déja dans la base de données aka a deja un compte", // response desc.
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessage", // User model
              },
            },
          },
        },
        // response code
        500: {
          description: "réponse si le serveur a rencontré une situation qu'il ne sait pas gérer", // response desc.
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessage", // error data model
              },
            },
          },
        },
      },
    },
  };