import React from "react";

import "./styles.css";

import { Members } from "./interfaces";
import members from "./members.json";
import { render } from "react-dom";

export default function App() {
  const [arrayMembers, setarrayMembers] = React.useState<Members[]>([]);

  const arrayOthers = [];
  const arrayParents = [];
  const arrayLinkThemselves = [];
  let arrayPayers = [];
  const arrayCircleRef = [];
  const arrayChildren = [];

  /**
   -------------------------------------------------------------------------------------------------------------------------------------------------------------
   TRI DES MEMBRES :
   -----------------
   Étape 1 : récupération des membres parents (immédiatement classés parmi les "membres payeurs") + création d'un tableau pour les autres membres
   Étape 2 : comparaison des tableaux "membres parents"/"autres membres"(dont enfants dépendants) en vue de repérer les dépendances
   Étape 3 : capatation des membres liés à eux-mêmes, stockage chez les payeurs puis suppression dans le tableau "autres membres"
   Étape 4 : mise à l'écart des enfants identifiés appartenant à des parents
   Étape 5 : voir function "checkCircleReferences()": récupération des affectations entre membres "non parents" puis repérage des éventuelles références circulaires
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------
**/
  function sortMembers() {
    let datas = arrayMembers.values();

    //-----------
    // Étape 1
    //-----------

    for (const value of datas) {
      let linkId = value.linkId;

      if (linkId === null) {
        arrayParents.push(value);
        arrayPayers.push(value);
      } else {
        arrayOthers.push(value);
      }
    }

    //-----------
    // Étape 2
    //-----------

    for (let index = 0; index < arrayOthers.length; index++) {
      const dataOther = arrayOthers[index];
      const dataOtherLinkId = dataOther.linkId;

      //-----------
      // Étape 3
      //-----------

      if (dataOther.id === dataOtherLinkId) {
        arrayLinkThemselves.push(dataOther);
        arrayPayers.push(dataOther);
        delete arrayOthers[index];
      }

      //-----------
      // Étape 4
      //-----------
      else {
        for (const dataParent of arrayParents) {
          let parentId = dataParent.id;
          if (parentId === dataOtherLinkId) {
            arrayChildren.push(dataOther);
            delete arrayOthers[index];
          }
        }
      }
    }
  }

  /**
  //-----------
  // Étape 5
  //-----------
   *
   * fonction checkCircleReferences(): repérage des références circulaires
   *
   * °°°°°°°°°°
   * Synopsis 
   * °°°°°°°°°°
   * 
   * Un tableau de départ "arrayOthers" (celui des membres "non parents") sera parcouru
   * pour être comparé à un autre sain "arrayClean" ne devant conserver que les
   * membres sans parents, mais devant faire l'objet d'une facturation.
   * 
   * Si au moins une référence circulaire est repérée lors du traitement, la donnée sera
   * stockée dans un tableau prévu à cet effet "arrayCircleRef"
   * 
   * °°°°°°°°°
   * Méthode 
   * °°°°°°°°°
   * 
   * Étape 0 : on s'assure que les données soient correctement triées pour la suite des opérations
   * Étape 1 : la première data de "arrayOthers" est de suite envoyée dans le tableau sain "arrayClean"
   * Étape 2 : parcours des deux tableaux de façon croisée entre les id du premier
   * et les linkId du deuxième, puis inversement.
   * Étape 3 : si une occurence est détectée, la data parasite est stockée dans 
   * le tableau "arrayCircleRef" puis détruite du tableau initial "arrayOthers"
   * Étape 4 : les données non parasites sont finalement stockées une à une dans 
   * le tableau sain "arrayClean" pour la suite des opérations et également dans le
   * tableau des membres payeurs "arrayPayers"
   * Étape 5 : récupération de l'ensembles des membres faisant partie d'une référence circulaire détectée
   *
   */

  function checkCircleReferences() {
    //-----------
    // Étape 0
    //-----------

    arrayOthers.sort();

    //-----------
    // Étape 1
    //-----------

    let arrayClean = [];
    for (let index = 0; index < arrayOthers.length; index++) {
      let element = arrayOthers[index];

      if (arrayClean.length === 0) {
        arrayClean.push(element);
        arrayPayers.push(element);
        delete arrayOthers[index];
      }

      //-----------
      // Étape 2
      //-----------
      else {
        if (element !== undefined) {
          let checkId = false;
          let checkLinkId = false;

          for (let i = 0; i < arrayClean.length; i++) {
            if (element.linkId === arrayClean[i].id) checkId = true;
            if (element.id === arrayClean[i].linkId) checkLinkId = true;
            //-----------
            // Étape 3
            //-----------

            if (checkId && checkLinkId) {
              arrayCircleRef.push(element);
              delete arrayOthers[index];
            }
          }
          //-----------
          // Étape 4
          //-----------
          if (arrayOthers[index] !== undefined) {
            arrayClean.push(element);
            arrayPayers.push(element);
          }
        }
      }
    }
    //-----------
    // Étape 5
    //-----------
    if (arrayCircleRef.length !== 0) {
      let arrayLocalMembers = [];
      arrayLocalMembers = arrayMembers;
      arrayLocalMembers.sort();
      let arrayTempCirc = [];
      let arrayLocalCircId = [];
      let tempCirc = [];
      for (let index = 0; index < arrayCircleRef.length; index++) {
        const ele = arrayCircleRef[index];
        if (ele !== undefined) {
          arrayLocalCircId.push(ele.id);
          let circId = ele.id;
          let circLinkId = ele.linkId;

          if (!arrayCircleRef.includes(circId)) arrayTempCirc.push(circId);
          if (!arrayCircleRef.includes(circLinkId))
            arrayTempCirc.push(circLinkId);
        }
        for (let index = 0; index < arrayTempCirc.length; index++) {
          const element = arrayMembers[index];
          tempCirc.push(element);
        }
      }
      for (let index = 0; index < tempCirc.length; index++) {
        const element = arrayMembers[index];
        arrayCircleRef.push(element);
      }
    }
  }

  /**
   * findPayers : retrouve les payeurs du club
   *
   */
  function findPayers() {
    let localArray = [];
    let temp = [];
    for (let index = 0; index < arrayPayers.length; index++) {
      let element = arrayPayers[index];
      //console.log(element);
      let payerId = element.id;
      let payerlinkId = element.linkId;

      if (payerlinkId === null || payerlinkId === payerId) {
        localArray.push(element);
        delete arrayPayers[index];
      } else temp.push(element);
    }

    //

    for (let num = 0; num < arrayCircleRef.length; num++) {
      const elem = arrayCircleRef[num];
      //console.log(element);
      for (let nbr = 0; nbr < arrayOthers.length; nbr++) {
        const e = arrayOthers[nbr];
        if (e !== undefined) {
          if (!arrayChildren.includes(e.id)) {
            arrayChildren.push(e);
            delete arrayOthers[nbr];
          }
        }
      }
    }
    //console.log(arrayChildren);

    //

    for (let ind = 0; ind < temp.length; ind++) {
      const ele = temp[ind];

      for (let i = 0; i < arrayPayers.length; i++) {
        const el = arrayPayers[i];
        if (el !== undefined) {
          //console.log("identifiant arrayPayers : "+el.id+" ET identifiant temp : "+ele.linkId)
          if (ele.linkId === el.id) {
            localArray.push(el);
            delete arrayPayers[i];
          }
        }
      }
      //console.log(localArray);
    }
    arrayPayers = localArray;
    //console.log(arrayOthers);
  }

  /***
   * Affiche les différents résultats dans la console du navigateur
   */
  function showMembers() {
    let children = "Les enfants sont : \n";
    for (let index = 0; index < arrayChildren.length; index++) {
      const element = arrayChildren[index];
      children += element.name + "\n";
    }
    console.log(children);
    //
    let parents = "Les adultes sont : \n";
    for (let index = 0; index < arrayParents.length; index++) {
      const element = arrayParents[index];
      parents += element.name + "\n";
    }
    console.log(parents);
    //
    let enfantsSansParents =
      "Les enfants inscrits, sans appartenance aux adultes sont : \n";
    for (let index = 0; index < arrayLinkThemselves.length; index++) {
      const element = arrayLinkThemselves[index];
      enfantsSansParents += element.name + "\n";
    }
    console.log(enfantsSansParents);
    //
    let referencesCirculaires =
      "Les avec conflit d'enregistrement (références circulaires) sont : \n";
    for (let index = 0; index < arrayCircleRef.length; index++) {
      const element = arrayCircleRef[index];
      referencesCirculaires += element.name + "\n";
    }
    console.log(referencesCirculaires);
    //
    let payeurs = "Les membres payant une cotisation sont : \n";
    for (let index = 0; index < arrayPayers.length; index++) {
      const element = arrayPayers[index];
      payeurs += element.name + "\n";
    }
    console.log(payeurs);
  }

  //-------------------------------------------------------------------
  // Appel de l'API au chargement de la page
  //-------------------------------------------------------------------

  React.useEffect(() => {
    setarrayMembers(members);
    sortMembers();
    checkCircleReferences();
    findPayers();
    //console.log(arrayChildren);
    showMembers();
  });

  //-------------------------------------------------------------------
  // Rendu final
  //-------------------------------------------------------------------

  return (
    <div className="App">
      <h1>Membres du club</h1>
    </div>
  );
}
/**
 * 
 * Créer une fonction en JS (ou Typescript) d'analyse de données :
Avec un tableau de membres d'un club, déterminer, selon les liens entre les membres, les membres devant être facturés ainsi que le nombre et/ou les noms des enfants dépendants (=membres dépendants) : 
- Chaque membre possède un Id numérique et un linkId numérique. 
- Les membres sont donc liés ensemble par leur linkId. 
- Un membre ayant un linkId != null est un enfant (donc on ne le facture pas), 
- un membre n'ayant pas de linkId (== null) est un parent (avec ou sans enfants).
 - Si le membre est lié à un autre membre, c'est le membre cible qui doit être facturé (exemple, enfant d'un parent), s'il n'a pas lui-même un lien vers un autre membre
 - L'algorithme doit détecter les références circulaires (exemple A lié à B lié à A, ou A lié à B lié à C lié à A, ou encore A lié à A, B lié à B...)
(Tableau de membres joint au mail au format .json)
 * 
 * 
 * 
 */
