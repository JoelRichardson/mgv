import u from '@/lib/utils'
import config from '@/config'
//
class HomologyManager {
  //
  constructor (dataManager, url) {
    this.dataManager = dataManager
    this.app = this.dataManager.app
    //  Organize pairwise assertions into multilevel mapping:
    //          taxonA -> taxonB -> idA -> [idB]
    this.index = {}
    this.readyP = u.fetch(url+ '/homologies.json', 'json').then(data => {
      // Each row of data is a list of five values:
      //    [idA, taxonA, idB, taxonB, YNcode]
      // Example:
      //    ["FB:FBgn0000028","7227","ZFIN:ZDB-GENE-000523-2","7955","NY"]
      data.forEach(r => {
        // extract the row into vars
        const idA = r[0]
        const txA = r[1]
        const idB = r[2]
        const txB = r[3]
        const yn  = r[4]
        // add to index
        // get (and init, if necessary) top level index, by taxon A
        const i0 = this.index[txA] = (this.index[txA] || {})
        // get (and init, if necessary) second level index, by taxon B
        const i1 = i0[txB] = (i0[txB] || {})
        // get (and init, if necessary) list of homologs for idA in taxon B
        const ar = i1[idA] = (i1[idA] || [])
        // add idB
        ar.push(idB)
      })
      //
      this.app.$root.$on('taxons-changed', d => {
        this.computeAllInferredParalogs()
      })
      //
      return true
    })
  }
  // Returns a promise that resolves (to true) when I'm ready to go
  ready () {
    return this.readyP
  }
  // For each specified taxon, computes inferred paralogs, relative to all the rest
  computeAllInferredParalogs (txAs) {
    console.log('Computing inferred paralogs...')
    txAs = txAs || this.app.vTaxons
    txAs.map(txA => this.computeInferredParalogs(txA, txAs))
    console.log('Done.')
  }
  // Computes inferred paralogs for all txA ids, relative to the specified list of taxons.
  // Records results in the main index (at this.index[txA][txA])
  computeInferredParalogs (txA, txBs) {
     const Aix = this.index[txA] = (this.index[txA] || {})
     const paraIx = this.index[txA][txA] = {}
     txBs.forEach(txB => {
       if (txA === txB) return []
       const Bix = this.index[txB] || {}
       const ABix = Aix[txB] || {}
       const BAix = Bix[txA] || {}
       // at this point, ABix is the A->B orthology index and BAix is the B->A index.
       // for every id in ABix find its B ortholog ids, then map each B id back to its
       // A orthologs.
       for (let idA in ABix) {
         const idBs = ABix[idA] || []
         const idAs = u.flatten(idBs.map(idB => BAix[idB] || []))
         if (paraIx[idA]) {
           paraIx[idA] = paraIx[idA].concat(idAs)
         } else {
           paraIx[idA] = idAs
         }
       }
       // Eliminate duplicates from the lists of paralogs
       for (let idA in paraIx) {
         paraIx[idA] = Array.from(new Set(paraIx[idA]))
       }
     })
  }
  //
  // For a given (canonical) id in a given taxon, returns
  // list of all homologous (canonical) ids from specified taxons.
  getHomologIds (idA, txA, txBs) {
    const Aix = this.index[txA] || {}
    const homIds = txBs.map(txB => {
      const ABix = Aix[txB] || {}
      const homs = ABix[idA] || []
      if (txA === txB && homs.indexOf(idA) === -1) {
         homs.push(idA)
      }
      return homs
    })
    return u.flatten(homIds)
  }
  // Extended version of getHomologIds. Also includes orthologs of idA's paralogs.
  getHomologIdsExt (idA, txA, txBs) {
    const idAs = this.getInferredParalogIds(idA, txA)
    const idBs = idAs.map(a => this.getOrthologIds(a, txA, txBs))
    idBs.push(idAs)
    return Array.from(new Set(u.flatten(idBs)))
  }
  //
  getOrthologIds (idA, txA, txBs) {
    return this.getHomologIds(idA, txA, txBs.filter(txB => txB !== txA))
  }
  //
  getInferredParalogIds (idA, txA) {
    return this.getHomologIds(idA, txA, [txA])
  }
}
export default HomologyManager
