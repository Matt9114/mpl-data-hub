<template>
  <div class="wa-page-wrapper">
    <!-- HLAVNÁ SEKCIA -->
    <section class="wa-main-area">
      <!-- HEADER -->
      <div class="wa-header-top">
        <h1 class="wa-title">Production / POF Report (Done / Not completed)</h1>
        <p>Last update: {{ lastUpdate }}</p>
        <p class="wa-subtitle">
          BigBig table with Prio, Date, HOUR, PartNumber, SAP, etc.
          Mark rows as <em>Done</em> or keep them <em>Not completed</em>.
        </p>
      </div>

      <!-- Tlačidlá -->
      <div class="wa-button-row">
        <button class="wa-btn wa-primary-btn" @click="refreshData">Refresh</button>
        <button class="wa-btn wa-secondary-btn" @click="exportXLSX">Export XLSX</button>
        <button class="wa-btn wa-secondary-btn" @click="exportPdf">Export PDF</button>
        <button class="wa-btn wa-tertiary-btn" @click="clearAllFilters">Clear Filters</button>

        <button class="wa-btn wa-tertiary-btn" @click="showGuideModal">Guide</button>
        <button class="wa-btn wa-tertiary-btn" @click="showIssueModal">Report Issue</button>
      </div>

      <!-- FILTER + SEARCH -->
      <div class="wa-filter-row">
        <input
          type="text"
          class="wa-search-input"
          placeholder="Search part number..."
          v-model="searchQuery"
        />
        <select class="wa-status-filter" v-model="statusFilter">
          <option value="All">All</option>
          <option value="Done">Done only</option>
          <option value="NotDone">Not completed</option>
        </select>
      </div>

      <!-- BULK SEKCIA (zobrazená, ak selectedRows.size > 0) -->
      <div class="wa-bulk-panel" v-if="selectedRows.size > 0">
        <p>
          <strong>{{ selectedRows.size }}</strong> row(s) selected.
          <button class="wa-btn wa-primary-btn" @click="bulkMarkAsDone">Mark as Done</button>
          <button class="wa-btn wa-primary-btn" @click="bulkMarkAsNotCompleted">Mark as Not Completed</button>
          <button class="wa-btn wa-tertiary-btn" @click="bulkClearSelection">Clear selection</button>
        </p>
      </div>

      <!-- TABLE WRAPPER -->
      <div class="wa-table-wrapper">
        <table class="wa-table">
          <thead>
            <tr>
              <!-- Checkbox pre 'Select all' -->
              <th>
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  aria-label="Select all on this page"
                />
              </th>
              <th @click="sortBy('prio')">Prio</th>
              <th @click="sortBy('date')">Date</th>
              <th @click="sortBy('hour')">HOUR</th>
              <th @click="sortBy('partNumber')">Part Number</th>
              <th @click="sortBy('sap')">SAP</th>
              <th @click="sortBy('stock')">stock</th>
              <th @click="sortBy('demandNext400')">Demand next 400</th>
              <th @click="sortBy('qtyHUNeeded')">QTY HU needed</th>
              <th @click="sortBy('carsToStop')">carsToStop</th>
              <th @click="sortBy('pofLineside')">POF Lineside</th>
              <th @click="sortBy('pofKitting')">POF Kitting</th>
              <th @click="sortBy('balenie')">Balenie</th>
              <th @click="sortBy('vendor')">Vendor</th>
              <th @click="sortBy('transportationUnit')">Transportation Unit</th>
              <th @click="sortBy('location')">LOCATION</th>
              <th @click="sortBy('binSpz')">BIN / ŠPZ</th>
              <th @click="sortBy('dc4Status')">DC4 STATUS</th>
              <th @click="sortBy('rcvInfo')">RCV info</th>
              <th @click="sortBy('statusDhl')">STATUS DHL</th>
              <!-- stĺpec Status (Done / "") -->
              <th @click="sortBy('status')">Status</th>
            </tr>
          </thead>

          <!-- transition-group v <tbody> -->
          <transition-group tag="tbody" name="fade">
            <tr
              v-for="(item, index) in paginatedData"
              :key="item.partNumber + '-' + index"
              :class="{ 'done-row': item.status === 'Done' }"
            >
              <!-- Checkbox pre tento riadok -->
              <td>
                <input
                  type="checkbox"
                  :checked="selectedRows.has(item)"
                  @change="onRowCheckboxChange(item)"
                  :aria-label="`Select product ${item.partNumber}`"
                />
              </td>
              <td>{{ item.prio }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.hour }}</td>
              <td>{{ item.partNumber }}</td>
              <td>{{ item.sap }}</td>
              <td>{{ item.stock }}</td>
              <td>{{ item.demandNext400 }}</td>
              <td>{{ item.qtyHUNeeded }}</td>
              <td>{{ item.carsToStop }}</td>
              <td>{{ item.pofLineside }}</td>
              <td>{{ item.pofKitting }}</td>
              <td>{{ item.balenie }}</td>
              <td>{{ item.vendor }}</td>
              <td>{{ item.transportationUnit }}</td>
              <td>{{ item.location }}</td>
              <td>{{ item.binSpz }}</td>
              <td>{{ item.dc4Status }}</td>
              <td>{{ item.rcvInfo }}</td>
              <td>{{ item.statusDhl }}</td>
              <!-- Status stĺpec -->
              <td :class="{ done: item.status === 'Done' }">
                {{ item.status }}
              </td>
            </tr>
          </transition-group>
        </table>
      </div>

      <!-- PAGINÁCIA -->
      <div class="wa-pagination">
        <button class="wa-page-btn" :disabled="currentPage === 1" @click="prevPage">Prev</button>
        <span class="wa-page-info">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="wa-page-btn" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div>

      <!-- FOOTER NOTE -->
      <div class="wa-footer-note">
        <p>
          <strong>Note:</strong> This is purely fictional data. 20 columns, plus "Status" (Done / Not done).
        </p>
      </div>
    </section>

    <!-- MODAL GUIDE -->
    <div class="modal-backdrop" v-if="showGuideModalVar">
      <div class="modal-content">
        <h2>Guide</h2>
        <p>Some instructions or help text here...</p>
        <div class="modal-actions">
          <button class="wa-btn wa-primary-btn" @click="closeGuideModal">Close</button>
        </div>
      </div>
    </div>

    <!-- MODAL REPORT ISSUE -->
    <div class="modal-backdrop" v-if="showIssueModalVar">
      <div class="modal-content">
        <h2>Report Issue</h2>
        <textarea
          class="modal-textarea"
          placeholder="Describe the issue..."
          v-model="issueText"
        ></textarea>
        <div class="modal-actions">
          <button class="wa-btn wa-primary-btn" @click="submitIssue">Submit</button>
          <button class="wa-btn wa-tertiary-btn" @click="closeIssueModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/** Rozhranie (20 stĺpcov + "status") */
interface RowItem {
  prio: number
  date: string
  hour: string
  partNumber: string
  sap: string
  stock: number
  demandNext400: number
  qtyHUNeeded: number
  carsToStop: number
  pofLineside: string
  pofKitting: string
  balenie: string
  vendor: string
  transportationUnit: string
  location: string
  binSpz: string
  dc4Status: string
  rcvInfo: string
  statusDhl: string
  status: string // "Done" | ""
}

/** Príklad dát */
const tableData = ref<RowItem[]>([
  {
    prio: 1,
    date: '2025-01-25',
    hour: '08:00',
    partNumber: 'ABC12345',
    sap: 'SAP-987',
    stock: 12,
    demandNext400: 50,
    qtyHUNeeded: 2,
    carsToStop: 0,
    pofLineside: 'Yes',
    pofKitting: 'No',
    balenie: 'Box',
    vendor: 'Vendor A',
    transportationUnit: 'T-Unit-01',
    location: 'LOC-A1',
    binSpz: 'BIN-001',
    dc4Status: 'OK',
    rcvInfo: 'Received partial',
    statusDhl: 'Shipped',
    status: 'Done'
  },
  {
    prio: 2,
    date: '2025-01-25',
    hour: '09:30',
    partNumber: 'XYZ555',
    sap: 'SAP-555',
    stock: 0,
    demandNext400: 30,
    qtyHUNeeded: 3,
    carsToStop: 2,
    pofLineside: 'No',
    pofKitting: 'Yes',
    balenie: 'Bag',
    vendor: 'Vendor B',
    transportationUnit: 'Truck-19',
    location: 'LOC-B2',
    binSpz: 'SPZ-123',
    dc4Status: 'Pending',
    rcvInfo: 'Waiting rcv',
    statusDhl: 'In Transit',
    status: ''
  }
])

const lastUpdate = ref('2025-01-25 08:00')

// Filtrovanie, hľadanie, triedenie
const searchQuery = ref('')
const statusFilter = ref<'All' | 'Done' | 'NotDone'>('All')
type SortKey =
  | 'prio'
  | 'date'
  | 'hour'
  | 'partNumber'
  | 'sap'
  | 'stock'
  | 'demandNext400'
  | 'qtyHUNeeded'
  | 'carsToStop'
  | 'pofLineside'
  | 'pofKitting'
  | 'balenie'
  | 'vendor'
  | 'transportationUnit'
  | 'location'
  | 'binSpz'
  | 'dc4Status'
  | 'rcvInfo'
  | 'statusDhl'
  | 'status'
const sortKey = ref<SortKey>('partNumber')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Paginate
const currentPage = ref(1)
const pageSize = 5

// Watcher => reset page pri zmene filtra alebo search
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

const filteredAndSearchedData = computed(() => {
  let arr = [...tableData.value]

  // Filter: Done / NotDone / All
  if (statusFilter.value === 'Done') {
    arr = arr.filter(row => row.status === 'Done')
  } else if (statusFilter.value === 'NotDone') {
    arr = arr.filter(row => row.status === '')
  }

  // Search: partNumber
  if (searchQuery.value.trim()) {
    const sq = searchQuery.value.toLowerCase()
    arr = arr.filter(row => row.partNumber.toLowerCase().includes(sq))
  }

  // Sort
  arr.sort((a, b) => {
    const valA = (a as any)[sortKey.value]
    const valB = (b as any)[sortKey.value]
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return arr
})

const totalPages = computed(() => {
  return Math.ceil(filteredAndSearchedData.value.length / pageSize)
})
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  return filteredAndSearchedData.value.slice(startIndex, startIndex + pageSize)
})

// Selection (bulk)
const selectedRows = ref<Set<RowItem>>(new Set())

const onRowCheckboxChange = (row: RowItem) => {
  if (selectedRows.value.has(row)) {
    selectedRows.value.delete(row)
  } else {
    selectedRows.value.add(row)
  }
}
const isAllSelected = computed(() => {
  const onPage = paginatedData.value
  return onPage.length > 0 && onPage.every(r => selectedRows.value.has(r))
})
const toggleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  paginatedData.value.forEach(r => {
    if (checked) selectedRows.value.add(r)
    else selectedRows.value.delete(r)
  })
}

// Bulk actions
const bulkMarkAsDone = () => {
  selectedRows.value.forEach(row => { row.status = 'Done' })
  alert('Marked selected rows as Done.')
}
const bulkMarkAsNotCompleted = () => {
  selectedRows.value.forEach(row => { row.status = '' })
  alert('Marked selected rows as Not Completed.')
}
const bulkClearSelection = () => {
  selectedRows.value.clear()
}

// Tlačidlá
const refreshData = () => {
  alert('Refreshing data... (fake fetch).')
  lastUpdate.value = new Date().toISOString().slice(0,16).replace('T',' ')
}
const exportXLSX = () => {
  alert('Export XLSX clicked. (Fake logic).')
}
const exportPdf = () => {
  alert('Export PDF clicked. (Fake logic).')
}
const clearAllFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'All'
  sortKey.value = 'partNumber'
  sortOrder.value = 'asc'
  currentPage.value = 1
  selectedRows.value.clear()
}

// Modaly
const showGuideModalVar = ref(false)
const showGuideModal = () => { showGuideModalVar.value = true }
const closeGuideModal = () => { showGuideModalVar.value = false }

const showIssueModalVar = ref(false)
const issueText = ref('')
const showIssueModal = () => { showIssueModalVar.value = true }
const closeIssueModal = () => {
  showIssueModalVar.value = false
  issueText.value = ''
}
const submitIssue = () => {
  alert(`Issue submitted with text: ${issueText.value}`)
  closeIssueModal()
}

// Sort
const sortBy = (key: SortKey) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
</script>

<style scoped>
/* 
  Všetky štýly nastavené tak, aby neprekrývali sidebar.
  Žiadne min-height: 100vh; atď.
*/
.wa-page-wrapper {
  padding: 20px;
  background-color: #2e2e31; /* ak nechceš tmavé, odstráň alebo zmeň */
  color: #eee;
}

.wa-main-area {
  padding: 20px 0; 
}

.wa-header-top {
  margin-bottom: 20px;
}
.wa-title {
  font-size: 24px;
  font-weight: 700;
  color: #f0a515;
}
.wa-subtitle {
  font-size: 14px;
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 10px;
}

.wa-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.wa-btn {
  border: none;
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.wa-primary-btn {
  background-color: #3d3b3b;
  color: #fff;
  border: 1px solid #555;
}
.wa-secondary-btn {
  background-color: rgba(255,255,255,0.1);
  color: #eee;
  border: 1px solid #666;
}
.wa-tertiary-btn {
  background-color: rgba(255,255,255,0.05);
  color: #ccc;
  border: 1px dashed #777;
}

.wa-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.wa-search-input,
.wa-status-filter {
  border: 1px solid #555;
  background-color: #2e2e31;
  color: #fff;
  border-radius: 4px;
  padding: 8px;
}

.wa-bulk-panel {
  margin-bottom: 20px;
  color: #f0a515;
}
.wa-bulk-panel button {
  margin-left: 10px;
}

/* Table */
.wa-table-wrapper {
  overflow-x: auto; /* horizontálny scroll pri veľa stĺpcoch */
  margin-bottom: 20px;
}
.wa-table {
  border-collapse: collapse;
  background-color: #2e2e31;
  border: 1px solid #3d3b3b;
  color: #ccc;
  text-align: center;
  /* Minimálna šírka, ak je 20 stĺpcov */
  min-width: 1300px;
}
.wa-table thead {
  background-color: #3d3b3b;
}
.wa-table th,
.wa-table td {
  padding: 10px;
  border-bottom: 1px solid #555;
}

/* DONE = zelený pásik naľavo + zelený text v stĺpci */
.done-row {
  border-left: 4px solid #088b23;
}
.done {
  color: #088b23;
  font-weight: bold;
}

/* Pagination */
.wa-pagination {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}
.wa-page-btn {
  background-color: #3d3b3b;
  color: #fff;
  border: 1px solid #555;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.wa-page-info {
  font-size: 14px;
  color: #ccc;
}

/* Footer note */
.wa-footer-note {
  font-size: 13px;
  color: #999;
  margin-bottom: 30px;
}

/* Transition group fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: #2e2e31;
  padding: 20px;
  border: 1px solid #555;
  border-radius: 6px;
  color: #fff;
  width: 400px;
  max-width: 90%;
}
.modal-textarea {
  width: 100%;
  height: 70px;
  background-color: #1f1f23;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 10px;
  padding: 6px;
}
.modal-actions {
  text-align: right;
}
</style>
