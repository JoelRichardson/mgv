<template>
  <div class="mgv-app">
    <m-header @gear-clicked="toggleDrawer" ref="header"></m-header>
    <div name="content" class="flexrow">
      <!--
      ============ Left column ==============================================
      -->
      <page-box-container
        name="leftColumn"
        ref="toolDrawer"
        class="flexcolumn"
        :class="{ open: drawerOpen, closed: !drawerOpen}"
        :style="{ height: visHeight + 'px' }"
        >
        <!--
        ============ Genomes ==============
        -->
        <page-box
          label="Genomes"
          icon="list"
          >
          <genome-selector
            :allGenomes="allGenomes"
            :strips="strips"
            :genomeSets="genomeSets"
            :rGenome="rGenome"
            title="Specify which genome(s) to display."
            ref="genomes"
            />
        </page-box>
        <!--
        ============ Gene Lists ==============
        -->
        <page-box
          label="Gene lists"
          icon="list"
          >
          <my-lists
            title="Create, display, and save lists of genes. A list simply contains identifiers. Create lists via searches, pasting identifiers, or combining other lists.  Click on a list to show its items in the genome view; click again to hide them. Click on the 'x' to delete a list. Click on the pencil to edit the list."
            ref="myLists"
            :lists="lists"
            :currentList="currentList"
            />
        </page-box>
        <!--
        ============ Facets (aka Filters) ==============
        -->
        <page-box
          :message="activeFacets.length ? 'There are active filters. Click to clear.' : ''"
          :messageClickHandler="clearFacets"
          label="Filters"
          icon="filter_list"
          >
          <facets
            title="Limit what features are displayed by different criteria."
            ref="facets"
            />
        </page-box>
        <!--
        ============ Settings ==============
        -->
        <page-box
          label="Settings"
          icon="settings"
          >
          <settings
            title="Provides options for customizing the display. Settings are remembered between sessions."
            ref="settings"
            />
        </page-box>
        <!--
        ============ Sequence Cart ==============
        -->
        <page-box
          label="Sequence Cart"
          icon="shopping_cart"
          >
          <sequence-cart
            title="Contains sequence (descriptors) that you select while browsing. Download sequences as Fasta, with options to reverse complement genomic sequences or translate CDSs."
            ref="sequenceCart"
            />
        </page-box>
      </page-box-container>
      <!--
      ============ Right column ==============================================
      -->
      <page-box-container
        name="rightColumn"
        :style="{ height: visHeight + 'px' }"
        class="flexcolumn">
        <!--
        ============== Zoom View ==============
        -->
        <page-box
          :message="activeFacets.length ? `Active filters (click to remove):\n${activeFacetsText}` : ''"
          :messageClickHandler="clearFacets"
          label="Zoom View"
          icon="view_agenda"
          >
          <zoom-view
            :context="$data"
            ref="zoomView"
            title="The main view. Shows features in selected regions of selected genomes. You can zoom, scroll, find genes, download sequences and more. These operations can affect regions independently or in synch using the lock icon. Most things can be undone using the browser's Back button."
            />
        </page-box>
        <!--
        ============== Gene View ==============
        <page-box
          label="Gene View"
          icon="view_agenda"
          >
          <gene-view
            :genes="detailFeatures"
            :showAllTranscripts="false"
            ref="geneView"
            title="GeneView shows the details of a single gene."
            />
        </page-box>
        -->
        <!--
        ============ Genome View ==============
        -->
        <page-box
          label="Genome View"
          icon="language"
          >
          <genome-view
            :context="$data"
            ref="genomeView"
            title="Shows a whole genome view. Colored tabs indicate any regions currently displayed in the ZoomView. Lollipop glyphs indicate current list items (if any). Drag tab to change the viewed region. Click or drag on a chromosome to open a new region."
            />
        </page-box>
        <!--
        ============ Feature Details ==========
        -->
        <page-box
          label="Feature Details"
          icon="description"
          >
          <feature-details
            ref="featureDetails"
            title="Shows details of a feature you click on. When open, shows details for homologs in all currently displayed genomes. When closed, shows only the feature in the genome that was clicked."
            :features="detailFeatures"
            :currentMouseover="currentMouseover"
            />
        </page-box>
      </page-box-container>
      <!--
      ============ Floating ==============================================
      -->
      <!--
      ============ List Editor ==============
      -->
      <page-box
        label="List Editor"
        :floating="true"
        :initialX="250"
        :initialY="100"
        :initiallyOpen="false"
        iconClose="close"
        ><list-editor
          title="Examine/modify the contents of a list. Create a new list. Combine lists with intersection, union, and difference."
          :list="currentEditList"
          ref="listEditor"
          />
      </page-box>
      <!--
      ============ Help Screen  ==============
      -->
      <page-box
        label="MGV Help"
        :floating="true"
        :initialX="350"
        :initialY="150"
        :initiallyOpen="false"
        ref="helpBox"
        >
        <help-box
          />
      </page-box>
    </div>
    <m-footer ref="footer"></m-footer>
  </div>
</template>

<script>
//
import ga from '@/lib/mgi_ga'
//
import Facets from '@/components/Facets'
import FeatureColorMap from '@/lib/FeatureColorMap'
import FeatureDetails from '@/components/FeatureDetails'
import FindGenes from '@/components/FindGenes'
import GeneView from '@/components/GeneView'
import GenomeSelector from '@/components/GenomeSelector'
import GenomeView from '@/components/GenomeView'
import HelpBox from '@/components/HelpBox'
import ListEditor from '@/components/ListEditor'
import MComponent from '@/components/MComponent'
import MFooter from '@/components/MFooter'
import MHeader from '@/components/MHeader'
import MyLists from '@/components/MyLists'
import PageBox from '@/components/PageBox'
import PageBoxContainer from '@/components/PageBoxContainer'
import Settings from '@/components/Settings'
import SequenceCart from '@/components/SequenceCart'
import ZoomView from '@/components/ZoomView'
//
import config from '@/config'
import u from '@/lib/utils'
//
import DataManager from '@/lib/DataManager'
import HistoryManager from '@/lib/HistoryManager'
import KeyManager from '@/lib/KeyManager'
import KeyStore from '@/lib/KeyStore'
import ListManager from '@/lib/ListManager'
import PreferencesManager from '@/lib/PreferencesManager'
import RegionManager from '@/lib/RegionManager'
//
export default MComponent({
  name: 'MGV',
  components: {
    Facets,
    FeatureDetails,
    FindGenes,
    GeneView,
    GenomeView,
    GenomeSelector,
    HelpBox,
    ListEditor,
    MHeader,
    MFooter,
    MyLists,
    PageBox,
    PageBoxContainer,
    SequenceCart,
    Settings,
    ZoomView
  },
  provide: function () {
    return {
      featureColorMap: this.featureColorMap,
      getFacets: function () {
        return this.$refs.facets
      }.bind(this),
      preferencesManager: function () {
        return this.preferencesManager
      }.bind(this),
      listManager: function () {
        return this.listManager
      }.bind(this),
      regionManager: function () {
        return this.regionManager
      }.bind(this),
      dataManager: function () {
        return this.dataManager
      }.bind(this)
    }
  },
  data: function () {
    return {
      // all genomes (order not important)
      allGenomes: [],
      // current reference genome
      rGenome: { name: '' },
      // current region = most recently clicked
      currRegion: null,
      // predefined sets of genomes for easy selections
      genomeSets: [],
      // when true, all regions scroll (and zoom and select sequenc) in sync.
      scrollLock: false,
      // Three ways to specify which regions to draw.
      // 1. Specify the regions explicitly. Each region is a genome+chr+start+end
      strips: [],
      // 2. Specify regions relative to a landmark.
      lcoords: {
        // alignment landmark
        landmark: null,
        // where on the landmark the alignment point is located
        // one of: fiveprime, threeprime, start, end, center
        alignTo: 'fiveprime',
        // delta in bp away from alignment point (for scrolling while aligned)
        delta: 0,
        // width of the region to show (in bp)
        length: 1000000,
        // for defining width as length(landmark) + 2*flank
        flank: 0
      },
      // 3. Specify a region in the ref genome. Use mapping to find regions in other genomes.
      coords: {
        chr: { name: '1' },
        start: 1,
        end: 10000000
      },
      // ----------------------------------------------------
      // is left drawer open
      drawerOpen: true,
      // while mouse is over a feature, its ID. Otherwise null.
      currentMouseover: null,
      // while mouse is over a transcript, its ID. Otherwise null.
      currentMouseoverT: null,
      // features to draw in the FeatureDetail section
      detailFeatures: [],
      // user lists
      lists: [],
      // currently selected features
      currentSelection: [],
      // currently displayed list
      currentList: null,
      // index into currently diaplayed list (for cycling through the features)
      currentListItem: 0,
      // current list as a Set for fast membership testing
      currentListSet: null,
      // list currently being edited
      currentEditList: null,
      // list of currently active facets
      activeFacets: [],
      // visible Height minus header and footer
      visHeight: 350
    }
  },
  computed: {
    currentSelectionToList: function () {
      const cHoms = this.currentSelection.map(f => this.dataManager.getHomologs(f, this.vGenomes))
      const cHomIds = new Set(u.flatten(cHoms).map(f => f.cID || f.ID))
      return Array.from(cHomIds)
    },
    currentSelectionSet: function () {
      const sids = u.flatten(this.currentSelection.map(f => this.dataManager.getHomologCids(f)))
      return new Set(sids)
    },
    currentSelectionLabel: function () {
      const ids = Array.from(new Set(this.currentSelection.map(f => f.symbol||f.cID||f.ID)))
      ids.sort()
      return ids.join(", ")
    },
    currentMouseoverSet: function () {
      if (this.currentMouseover) {
        const f = this.currentMouseover
        return new Set(this.dataManager.getHomologCids(f))
      } else {
        return new Set()
      }
    },
    agIndex: function () {
      return this.allGenomes.reduce((ix, g) => { ix[g.name] = g; return ix }, {})
    },
    zoomWidth: function () {
      return this.$refs.zoomView.$refs.main.width
    },
    vGenomes: function () {
      return this.strips.map(s => s.genome)
    },
    vTaxons: function () {
      return Array.from(new Set(this.vGenomes.map(g => this.dataManager.fixTaxonId(g.metadata.taxonid))))
    },
    activeFacetsText: function () {
      return this.activeFacets.map(f => {
        return `${f.facet} [${f.values.join(", ")}]`
      }).join("\n")
    },
    rStrip: function () {
      return this.strips.filter(s => s.genome === this.rGenome)[0]
    },
    includeParalogs: {
      get: function () {
        return config.MGV.includeParalogs
      },
      set: function (v) {
        config.MGV.includeParalogs = Boolean(v)
      }
    }
  },
  watch: {
    vTaxons: function () {
      this.$root.$emit('taxons-changed')
    }
  },
  methods: {
    /*
    DownloadImage    genomeView
    DownloadImage    zoomView
    ListOp           display
    ListOp           delete
    ListOp           edit
    ListOp           new
    DownloadSequence file      <totallength>
    DownloadSequence clipboard <totallength>
    DownloadSequence browser   <totallength>

    Navigate         zoom
    Navigate         scroll
    Navigate         etc...


    */
    logEvent: function (action, label, value) {
      ga.ga_logEvent("MGV", action, label, value)
    },
    /*
    // A higher level operation that focusses the user's view on the currently selected gene(s) by:
    // 1. Creating a list from the current selection
    // 2. Making it the current list
    // 3. Turning on the filter "Is in current list"
    // This has the effect of disappearing everything else
    focusOnSelected () {
      if (this.currentSelection.length === 0) {
        alert("Cannot focus on current selection: nothing selected.")
        return
      }
      const lst = this.listManager.newList("__focus__", this.currentSelectionToList, "#cccccc")
      this.setCurrentList(lst)
      this.$refs.facets.$refs.facets[3].selected = true
    },
    */
    // Toggle whether we are showing all feature labels or not.
    toggleShowAllLabels: function () {
      const cfg = config.ZoomRegion
      cfg.showFeatureLabels = !cfg.showFeatureLabels
    },
    toggleShowAllTranscripts: function () {
        config.ZoomRegion.showWhichTranscripts = (config.ZoomRegion.showWhichTranscripts + 1) % 3
        if (config.ZoomRegion.showWhichTranscripts === 1 && this.currentSelection.length === 0) config.ZoomRegion.showWhichTranscripts = 2
    },
    toggleIncludeParalogs: function () {
      this.includeParalogs = !this.includeParalogs
      this.$root.$emit('context-changed')
    },
    clearFacets: function () {
      this.$refs.facets.resetAll()
    },
    resize: function () {
      const sz = {width: u.wWidth(), height: u.wHeight()}
      this.visHeight = sz.height - 80
      this.$root.$emit('resize', sz)
    },
    initialize: function () {
      //
      // Kick things off by getting all the genomes we know about and all their chomosomes 
      // (names and lengths).
      //
      this.dataManager.getGenomes().then(genomes => {
        const byName = (a,b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)
        const part1 = genomes.filter(g => g.name.indexOf(".") === -1).sort(byName)
        const part2 = genomes.filter(g => g.name.indexOf(".") !== -1).sort(byName)
        genomes = part1.concat(part2)
        // now set up the initial state
        this.allGenomes = genomes // all the genomes (at least one)
        this.$refs.genomeView.genome = this.allGenomes[0]
        // initial hash from page URL
        const ih = u.deepCopy(this.historyManager.initialHash)
        ih.width = u.wWidth()
        // console.log('MGV: setting initial context', ih)
        this.setContext(ih, true).then(() => {
            this.$root.$emit('mgv-initialized')
        })
      })
    },
    //
    // This routine is called at initialization time or when user hit Back or Forward button
    // Sets the viewer state according to cxt, which basically is a set of arguments parsed from URL #-part
    //
    setContext: function (cxt, quietly) {
      //
      this.scrollLock =
        cxt.locked === "on" ? true :
        cxt.locked === "off" ? false : this.scrollLock
      //
      this.includeParalogs =   
        cxt.includeParalogs === "on" ? true :
        cxt.includeParalogs === "off" ? false : this.includeParalogs
      //
      if (cxt.style) {
          this.$refs.settings.setContextFromString(cxt.style)
      }
      //
      if (cxt.ref) {
        // make sure ref is included in genomes list
        if (!cxt.genomes) {
          cxt.genomes = [cxt.ref]
        } else if (cxt.genomes.indexOf(cxt.ref) === -1) {
          cxt.genomes.push(cxt.ref)
        }
        //
        const rg = this.agIndex[cxt.ref]
        if (rg) {
          this.rGenome = rg
          this.scrollLock = false
        }
      } else {
        this.rGenome = null
      }
      // 
      let genomes = [this.allGenomes[0]]
      if (cxt.genomes) {
        genomes = cxt.genomes.map(n => this.agIndex[n]).filter(x => x)
      }
      //
      let p
      if (this.rGenome && cxt.chr) {
        const c = this.rGenome.chromosomes.filter(chr => chr.name === cxt.chr)[0]
        const coords = {
          chr: c,
          start: cxt.start,
          end: cxt.end
        }
        p = this.regionManager.initMappedRegions(this.rGenome, coords, genomes)
      } else if (cxt.landmark) {
        const lcoords = {
           landmark: cxt.landmark,
           lgenome: genomes[0],
           delta: cxt.delta || 0
        }
        if (typeof(cxt.flank) === 'number') {
          lcoords.flank = cxt.flank
        } else {
           lcoords.length = cxt.length || 1000000
        }
        p = this.regionManager.alignOnLandmark(lcoords, genomes)
      } else if (cxt.strips) {
        // Map regions specs to specs with genome and chromosome names resolved to objects.
        const strips = cxt.strips.map(s => {
          const g = this.agIndex[s.genome]
          if (!g) return null
          return {
            genome: g,
            regions: s.regions.map(r => {
              return {
                genome: g,
                chr: g.chromosomes.filter(c => c.name === r.chr)[0],
                start: r.start,
                end: r.end,
                length: r.end - r.start + 1,
                width: r.width || r.end - r.start + 1
              }
            }).filter(r => r.chr)
          }
        }).filter(x => x)
        p = this.regionManager.initializeRegions(strips) 
      }
      // Set current selection from highlight ids
      return p.then(() => {
        //
        this.currentSelection = []
        // resolve current selection IDs to features
        const prs = this.vGenomes.map(g => {
          return this.dataManager.ensureFeatures(g).then(() => {
            (cxt.currentSelection || []).forEach(ident => {
              this.dataManager.getFeaturesBy(ident).filter(f => f.genome === g).forEach(f => {
                if (!f.cID || !this.currentSelectionSet.has(f.cID)) {
                  this.currentSelection.push(f)
                }
              })
            })
          })
        })
        return Promise.all(prs).then(() => {
            // make sure the genome order matches the order specified in the URL
            this.$nextTick(() => {
                this.$refs.zoomView.$refs.main.setYs('model')
            })
            if (!quietly) this.$root.$emit('context-changed')
        })
      })
    },
    unAlign: function () {
      this.lcoords.landmark = null
      this.$root.$emit('context-changed')
    },
    getContextString: function () {
      let cs = this.regionManager.getParameterString()
      if (this.currentSelection && this.currentSelection.length) {
        const ids = Array.from(new Set(this.currentSelection.map(f => f.cID || f.ID)))
        cs += `&highlight=${ids}`
      }

      //
      if (this.rGenome) cs += '&ref=' + this.rGenome.name
      else if (this.scrollLock) cs += '&lock=on'
      //
      cs += '&paralogs=' + (this.includeParalogs ? 'on' : 'off')
      //
      cs += '&style=' + this.$refs.settings.getContextString()
      return cs
    },
    openDrawer: function () {
      if (!this.drawerOpen) this.toggleDrawer()
    },
    closeDrawer: function () {
      if (this.drawerOpen) this.toggleDrawer()
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen
      window.setTimeout(this.resize.bind(this), this.cfg.animDur * 1000)
    },
    // FIXME All these handlers for features really belong somewhere else
    featureOver: function (f, t) {
      this.currentMouseover = f
      this.currentMouseoverT = t
    },
    featureOff: function () {
      this.currentMouseover = null
      this.currentMouseoverT = null
    },
    featureClick: function (f, t, e) {
      this.detailFeatures = this.dataManager.getHomologs(f, this.vGenomes)
      if (e.shiftKey) {
        const i = this.currentSelection.indexOf(f)
        if (i >= 0) {
          this.currentSelection.splice(i,1)
          this.currentMouseover = null
        } else {
          this.currentSelection.push(f)
        }
      } else {
        this.currentSelection = [f]
      }
      this.$root.$emit('selection-state-changed')
      this.$root.$emit('context-changed')
    },
    setCurrentList: function (lst) {
      this.currentList = lst
      this.currentListSet = new Set(lst.items)
      this.currentListItem = 0
    },
    stepCurrentList: function () {
      this.currentListItem = (this.currentListItem + 1) % this.currentList.items.length
    },
    clearCurrentList: function () {
      this.currentList = null
      this.currentListSet = null
      this.currentListItem = 0
    },
    initKeyBindings () {
      // Show/hide Labels
      this.keyManager.register({
       key: 'n',
       handler: () => {
         this.toggleShowAllLabels()
       },
       thisObj: this
      })
      // Expand/collapse
      this.keyManager.register({
       key: 'x',
       handler: () => this.toggleShowAllTranscripts(),
       thisObj: this
      })
      // Paralogs
      this.keyManager.register({
       key: 'p',
       handler: () => {
         this.toggleIncludeParalogs()
       },
       thisObj: this
      })
      // Help
      this.keyManager.register({
       key: 'h',
       handler: () => this.$refs.helpBox.toggleOpen(),
       thisObj: this
      })
      // Tool drawer
      this.keyManager.register({
       key: 't',
       handler: () => this.toggleDrawer(),
       thisObj: this
      })
      // Scroll lock
      this.keyManager.register({
       key: 'l',
       handler: () => {
         this.$root.$emit('region-change', { op : this.scrollLock ? 'clear-lock-mode' : 'set-lock-mode'})
       },
       thisObj: this
      })
      // Cancel drag
      this.keyManager.register({
       key: 'Escape',
       handler: () => {
         this.$root.$emit('escape-pressed')
       },
       thisObj: this
      })
      // Ref genome
      this.keyManager.register({
       key: 'r',
       handler: () => {
         if (this.rGenome) {
           this.$root.$emit('region-change', { op: 'clear-ref-genome' })
         } else {
           const s = this.$refs.zoomView.getTopStrip()
           s && this.$root.$emit('region-change', { op: 'set-ref-genome', genome: s.genome })
         }
       },
       thisObj: this
      })
      // Zoom in
      this.keyManager.register({
       key: 'ArrowUp',
       handler: (e) => {
         this.$root.$emit('region-change', {
           op: 'zoom',
           amt: e.shiftKey ? 0.1 : 0.5
         })
       },
       thisObj: this
      })
      // Zoom out
      this.keyManager.register({
       key: 'ArrowDown',
       handler: (e) => {
         this.$root.$emit('region-change', {
           op: 'zoom',
           amt: e.shiftKey ? 10 : 2
         })
       },
       thisObj: this
      })
      // Scroll right
      this.keyManager.register({
       key: 'ArrowRight',
       handler: (e) => {
         this.$root.$emit('region-change', {
           op: 'scroll',
           amt: e.shiftKey ? 0.8 : 0.2,
           sType: '%'
         })
       },
       thisObj: this
      })
      // Scroll left
      this.keyManager.register({
       key: 'ArrowLeft',
       handler: (e) => {
         this.$root.$emit('region-change', {
           op: 'scroll',
           amt: e.shiftKey ? -0.8 : -0.2,
           sType: '%'
         })
       },
       thisObj: this
      })
    },
    //
    clearCacheAndReload () {
      const kstore = new KeyStore(config.CachingFetcher.dbName)
      kstore.clear().then(() => {
        const kstore2 = new KeyStore(config.PreferencesManager.dbName)
        return kstore2.clear()
      }).then(() => {
        window.location.reload()
      })
    },
    purgeAndExit () {
      const allKstores = [
        config.CachingFetcher.dbName,
        config.PreferencesManager.dbName,
        config.ListManager.dbName,
        config.SequenceCart.dbName,
      ]
      Promise.all(allKstores.map(ks => (new KeyStore(ks)).clear())).then(() => {
        window.location = this.runtimeConfig.exitUrl
      })
    }
  },
  beforeCreate: function () {
    //
    this.featureColorMap = new FeatureColorMap()
    //
    this.preferencesManager = new PreferencesManager(this)
  },
  created: function () {
    this.runtimeConfig = this.$root.config
    //
    this.dataManager = new DataManager(this)
    //
    this.keyManager = new KeyManager(document.body)
    //
    this.historyManager = new HistoryManager(this)
    //
    this.listManager = new ListManager(this, this.lists)
    //
    this.regionManager = new RegionManager(this)
    //
    this.initKeyBindings()
  },
  mounted: function () {
    //
    this.genomeSets = this.cfg.genomeSets
    // a global handle for debugging
    window.app = this
    // be responsive to window size changes
    window.addEventListener('resize', () => this.resize())
    this.$nextTick(() => this.resize())

    //
    this.$root.$on('clear-cache-and-reload', () => {
      if (confirm('Clear data cache and reload this page. Are you sure?')) {
        this.clearCacheAndReload()
      }
    })
    //
    this.$root.$on('purge-and-exit', () => {
      if (confirm('Delete all data associated with this MGV instance. Includes lists, sequence cart items, preferences and cached data. Are you sure?')) {
        this.purgeAndExit()
      }
    })
    //
    this.$root.$on('no-align', () => this.unAlign())
    //
    this.$root.$on('clear-selection', () => {
      this.currentSelection = []
      this.$root.$emit('selection-state-changed')
      this.$root.$emit('context-changed')
    })
    //
    this.app.$root.$on('region-current', r => { this.currRegion = r ? r.region : null })
    //
    this.$root.$on('feature-over', arg => this.featureOver(arg.feature, arg.transcript, arg.event))
    this.$root.$on('feature-out', arg => this.featureOff(arg.feature, arg.transcript, arg.event))
    this.$root.$on('feature-click', arg => this.featureClick(arg.feature, arg.transcript, arg.event))
    //
    this.$root.$on('list-click', data => {
      let lst = data.list || data
      let shift = data.event ? data.event.shiftKey : false
      if (lst.items.length === 0) {
          this.clearCurrentList()
          return
      }
      if (lst === this.currentList) {
        if (shift) {
          // shift-click repeatedly on a list to step through its members
          this.stepCurrentList()
        } else {
          this.clearCurrentList()
          this.$root.$emit('list-selection', null)
          return
        }
      } else {
        this.logEvent('ListOp', 'display')
        this.setCurrentList(lst)
        this.$root.$emit('list-selection', this.currentList)
        if (!shift) return
      }
      let lm = lst.items[this.currentListItem]
      let lmf = this.dataManager.getFeaturesBy(lm)[0]
      if (lmf) this.$root.$emit('region-change', { op : 'feature-align', feature: lmf })
    })
    //
    this.$root.$on('list-delete', data => {
      if (this.currentList === data) {
        this.clearCurrentList()
      }
    })
    //
    this.$root.$on('list-edit-new', data => {
      if (data) {
        this.listManager.newList(data.name, data.items, data.color)
      } else {
        this.listManager.newList("New list")
        this.currentEditList = null
      }
    })
    //
    this.$root.$on('list-edit-newfromselected', () => {
      this.listManager.newList("selected", this.currentSelectionToList, "#cccccc")
    })
    //
    this.$root.$on('list-edit-open', data => {
      this.currentEditList = data.list
      this.$refs.listEditor.open()
    })
    //
    this.$root.$on('list-edit-cancel', () => {
      this.currentEditList = null
    })
    //
    this.$root.$on('list-edit-save', data => {
      this.listManager.updateList(this.currentEditList, data)
    })
    //
    this.$root.$on('facet-state', data => {
      this.activeFacets = data
    })
    // Here we go...
    this.initialize()
  }
})
</script>

<style>
html, body {
  height: 100%;
  margin: 0px;
  overflow: hidden;
}

/* scrollbar style not supported in FF  */
*::-webkit-scrollbar {
  width: 6px;
}
 
*::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  border-radius: 3px;
}
/* -----------------------------------------
 * Global styles for the app
 * -----------------------------------------
 */

.mgv-app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

/* -----------------------------------------
 * flexrow and flexcolumn
 * -----------------------------------------
 */
.flexrow {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.flexcolumn {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-grow: 1;
}

.flexrow > *,
.flexcolumn > * {
  padding: 2px;
}

button:hover {
  font-weight: bold;
}

.rotating {
    transform-origin: 50% 50%;
    -webkit-animation: rotation 2s infinite linear;
}

.rotateOnce {
    transform-origin: 50% 50%;
    -webkit-animation: rotation 2s linear;
}

@-webkit-keyframes rotation {
    from {
        -webkit-transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(-359deg);
    }
}

[name="content"] {
  align-items: flex-start;
}
[name="leftColumn"] {
  transition: min-width 0.5s, max-width 0.5s, opacity 0.5s;
  overflow-y: scroll; 
}
[name="rightColumn"] {
  overflow: scroll; 
}
[name="leftColumn"].open {
  min-width: 300px;
  max-width: 300px;
  opacity: 1;
}
[name="leftColumn"].closed {
  min-width: 0px;
  max-width: 0px;
  opacity: 0;
}
svg {
    width: 100%;
}
</style>
