/*
 * All site content lives here. Edit this file only; app.js renders it.
 * DEMO DATA: the person, institute, papers and figures below are illustrative
 * placeholders. Replace them before publishing. Empty strings hide a link.
 */
window.SITE = {
  person: {
    name: "Ira Vashisht",
    honorific: "Prof.",
    citeName: "I. Vashisht", // how the name appears in author lists (bolded)
    role: "Associate Professor of Computational Neuroscience",
    dept: "Department of Computer Science & Brain Sciences",
    institute: "Northfield Institute of Technology",
    thesis: "I study how networks of spiking neurons learn from very little data, and build machine learning systems that borrow those tricks.",
    email: "ira.vashisht@northfield.example.edu",
    office: "Room 4.12, Hartley Building, Northfield Campus",
    officeHours: "Tue & Thu, 15:00–16:30 (book a slot by email)",
    links: {
      cv: "",
      scholar: "",
      orcid: "",
      github: "",
      linkedin: ""
    }
  },

  metrics: [
    { label: "Citations", value: 4812 },
    { label: "h-index", value: 31 },
    { label: "Papers", value: 68 },
    { label: "PhDs graduated", value: 9 }
  ],

  bio: [
    "Ira Vashisht leads the Spiking Systems Lab at Northfield, where theory, large-scale simulation and neural recordings meet. Before joining Northfield in 2019, Ira was a postdoctoral fellow in theoretical neuroscience and completed a PhD in electrical engineering on low-power neuromorphic learning rules.",
    "The lab's work sits between neuroscience and machine learning: we derive learning rules from cortical data, test them in simulation, and then deploy them on energy-efficient hardware. Ira teaches the department's core courses on machine learning and computational neuroscience and serves on the program committees of NeurIPS and Cosyne."
  ],

  education: [
    { year: "2017–2019", what: "Postdoctoral Fellow, Theoretical Neuroscience" },
    { year: "2017", what: "PhD, Electrical Engineering (neuromorphic learning)" },
    { year: "2012", what: "B.Tech, Electronics & Communication" }
  ],

  research: [
    {
      id: "plasticity",
      title: "Learning rules in cortex",
      body: "Which synaptic plasticity rules let cortical circuits learn from a handful of examples? We fit candidate rules to paired recordings and keep the ones that predict behaviour.",
      keywords: ["STDP", "dendrites", "few-shot"]
    },
    {
      id: "snn",
      title: "Spiking neural networks",
      body: "Training deep spiking networks with surrogate gradients and local rules, aiming for accuracy that matches conventional nets at a fraction of the energy.",
      keywords: ["surrogate gradients", "event-based vision"]
    },
    {
      id: "neuromorphic",
      title: "Neuromorphic hardware",
      body: "Co-designing algorithms with analog and digital neuromorphic chips so that on-device learning runs within a milliwatt power budget.",
      keywords: ["on-chip learning", "edge AI"]
    },
    {
      id: "decoding",
      title: "Neural decoding",
      body: "Robust decoders for brain–computer interfaces that stay calibrated as recordings drift over weeks, in collaboration with clinical partners.",
      keywords: ["BCI", "domain shift"]
    }
  ],

  // type: journal | conference | preprint | book
  publications: [
    { year: 2026, type: "conference", selected: true, theme: "snn",
      title: "Event-driven credit assignment for deep spiking networks without backpropagation through time",
      authors: ["R. Menon", "T. Okafor", "I. Vashisht"], venue: "NeurIPS", pdf: "", code: "", doi: "" },
    { year: 2026, type: "preprint", theme: "plasticity",
      title: "Dendritic plateau potentials implement one-shot association in layer 5 pyramidal neurons",
      authors: ["S. Kaur", "I. Vashisht"], venue: "bioRxiv", pdf: "", code: "", doi: "" },
    { year: 2025, type: "journal", selected: true, theme: "plasticity",
      title: "A three-factor learning rule explains rapid place-field formation in CA1",
      authors: ["I. Vashisht", "L. Brandt", "S. Kaur"], venue: "Nature Neuroscience", pdf: "", code: "", doi: "" },
    { year: 2025, type: "conference", theme: "neuromorphic",
      title: "Sub-milliwatt on-chip few-shot learning with mixed-signal synapses",
      authors: ["A. Delgado", "R. Menon", "I. Vashisht"], venue: "ISSCC", pdf: "", code: "", doi: "" },
    { year: 2024, type: "journal", selected: true, theme: "decoding",
      title: "Drift-resilient intracortical decoding with self-supervised alignment",
      authors: ["M. Haddad", "P. Ruiz", "I. Vashisht"], venue: "Journal of Neural Engineering", pdf: "", code: "", doi: "" },
    { year: 2024, type: "conference", theme: "snn",
      title: "Sparse surrogate gradients for event-camera object tracking",
      authors: ["T. Okafor", "I. Vashisht"], venue: "CVPR", pdf: "", code: "", doi: "" },
    { year: 2023, type: "journal", theme: "neuromorphic",
      title: "Local learning rules for memristive crossbar arrays under device variability",
      authors: ["A. Delgado", "J. Lin", "I. Vashisht"], venue: "Nature Electronics", pdf: "", code: "", doi: "" },
    { year: 2023, type: "conference", selected: true, theme: "snn",
      title: "Temporal coding beats rate coding in low-latency spiking classifiers",
      authors: ["R. Menon", "I. Vashisht"], venue: "ICLR", pdf: "", code: "", doi: "" },
    { year: 2022, type: "journal", theme: "plasticity",
      title: "Inhibitory plasticity stabilises sequence learning in recurrent cortical models",
      authors: ["I. Vashisht", "L. Brandt"], venue: "PLOS Computational Biology", pdf: "", code: "", doi: "" },
    { year: 2021, type: "book", theme: "neuromorphic",
      title: "Learning on neuromorphic substrates",
      authors: ["I. Vashisht"], venue: "Handbook of Neuromorphic Engineering (chapter)", pdf: "", code: "", doi: "" },
    { year: 2020, type: "conference", theme: "decoding",
      title: "Few-shot calibration of speech BCIs with meta-learned priors",
      authors: ["P. Ruiz", "I. Vashisht"], venue: "EMBC", pdf: "", code: "", doi: "" },
    { year: 2019, type: "journal", theme: "plasticity",
      title: "Spike-timing-dependent plasticity with homeostatic constraints learns sparse codes",
      authors: ["I. Vashisht", "K. Abara"], venue: "Neural Computation", pdf: "", code: "", doi: "" }
  ],

  group: [
    { name: "Rohan Menon", role: "PhD candidate", topic: "Credit assignment in SNNs" },
    { name: "Simran Kaur", role: "PhD candidate", topic: "Dendritic computation" },
    { name: "Tobi Okafor", role: "PhD student", topic: "Event-based vision" },
    { name: "Ana Delgado", role: "Postdoc", topic: "Neuromorphic circuits" },
    { name: "Maya Haddad", role: "Research engineer", topic: "BCI decoding" },
    { name: "Pablo Ruiz", role: "Alumnus · now at a BCI start-up", topic: "Speech decoding" }
  ],

  openings: [
    "One fully funded PhD position (start Fall 2027) on learning rules in spiking networks.",
    "Master's thesis projects on event-camera models, every semester."
  ],

  teaching: [
    { code: "CS 4120", title: "Machine Learning", term: "Fall 2026", level: "Undergraduate", note: "Core course · 180 students" },
    { code: "BS 6230", title: "Computational Neuroscience", term: "Spring 2027", level: "Graduate", note: "Models of neurons, synapses and circuits" },
    { code: "CS 7905", title: "Neuromorphic Computing Seminar", term: "Spring 2027", level: "Graduate", note: "Paper reading + chip lab" }
  ],

  news: [
    { date: "2026-10", kind: "Talk", text: "Keynote on on-chip learning at the Edge AI Summit." },
    { date: "2026-09", kind: "Paper", text: "Event-driven credit assignment accepted at NeurIPS 2026." },
    { date: "2026-06", kind: "Grant", text: "Lab awarded a five-year young investigator grant for neuromorphic learning." },
    { date: "2026-05", kind: "Lab", text: "Pablo Ruiz defended his PhD. Congratulations, Dr. Ruiz!" },
    { date: "2025-11", kind: "Award", text: "Institute award for excellence in teaching (CS 4120)." }
  ],

  grants: [
    { years: "2026–2031", title: "Young Investigator Award: Learning on neuromorphic substrates", role: "PI" },
    { years: "2024–2027", title: "Drift-resilient brain–computer interfaces", role: "Co-PI" },
    { years: "2021–2024", title: "Energy-efficient spiking vision", role: "PI" }
  ]
};
