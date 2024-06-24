import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  // meta,/
  starbucks,
  tesla,
  shopify,
  carrent,
  jobit,
  // pbl,
  tripguide,
  threejs,
} from "../assets";

// import {pbl} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
  },
  {
    title: "Animation Libraries",
    icon: mobile,
  },
  {
    title: "MERN Developer",
    icon: backend,
  },
  {
    title: "UI/UX",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  // {
  //   name: "TypeScript",
  //   icon: typescript,
  // },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  // {
  //   name: "figma",
  //   icon: figma,
  // },
  // {
  //   name: "docker",
  //   icon: docker,
  // },
];

const experiences = [
  {
    title: "Web Developer",
    company_name: "Adsium innovation",
    // icon: starbucks,
    iconBg: "#383E56",
    date: "Octomber 2023 - December 2023",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
  // {
  //   title: "React Native Developer",
  //   company_name: "Tesla",
  //   // icon: tesla,
  //   iconBg: "#E6DEDD",
  //   date: "Jan 2021 - Feb 2022",
  //   points: [
  //     "Developing and maintaining web applications using React.js and other related technologies.",
  //     "Using different AI tools to make work faster and efficinet.",
  //     "Learn to optimize the webstie along with that also learn to load content faster.",
  //     "Collaborating with cross-functional teams including designers, and other developers to create high-quality websites.",
  //     "Implementing responsive design and ensuring cross-browser compatibility.",
  //     "Participating in code reviews and providing constructive feedback to other developers.",
  //   ],
  // },
  {
    title: "Karandak Campaining",
    company_name: "Sinhgad",
    // icon: shopify,
    iconBg: "#383E56",
    date: "Feb 2023 - April 2023",
    points: [
      "Learn to express myself in better way.",
      "Convecing other students to be the part of our college fests is great experience.",
      "Working with unkown students and making work done in efficient manner is really good.",
    ],
  },
  {
    title: "Hackathon",
    company_name: "AstroThon",
    // icon: meta,
    iconBg: "#E6DEDD",
    date: "Feb - 2022",
    points: [
      "Participate in AstroThon which is national level hackathon which was arranged by our team.",
      "Doing marketing with team mates and going other colleges to tell about our hackathon was good experience.",
      "Play a role as a photographer for the hackathon during prize distribution programm.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Rick does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const projects = [

  {
    name: "ST TimeTable",
    description:
    "In this project i'm provided ST time-table from current stop to destinaion stop. This is one of my working project as like Blinkit & Zomato i'm planning to add services in my website so that people need not to go outside the bus. ",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "axios",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: carrent,
    source_code_link: "https://github.com/sagarxjadhav/BusTime/tree/main",
  },
  {
    name: "Real Estate",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: jobit,
    source_code_link: "https://github.com/sagarxjadhav/RealEstate",
  },

  {
    name: "Fashion Hub",
    description:
    "This is single page website which is about fashion. I work with one of new library during building this project and that is shery.js ",
    tags: [
      {
        name: "sheryjs",
        color: "blue-text-gradient",
      },
      {
        name: "javascript",
        color: "pink-text-gradient",
      },
      {
        name: "html",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: tripguide,
    source_code_link: "https://github.com/sagarxjadhav/Fashion-Hub.git",
  },

  {
    name: "E-Library",
    description:
    "This is one of my PBL project. In this project i created a digital library where paid books will get at free of cost and students get to know books available from our library.",
    tags: [
      {
        name: "html",
        color: "blue-text-gradient",
      },
      {
        name: "css",
        color: "green-text-gradient",
      },
      {
        name: "javascript",
        color: "pink-text-gradient",
      },
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGzdcIXkgwVun9ghPk7zGEFGqOVee4H7tEwA&s",
    source_code_link: "https://github.com/sagarxjadhav/PBL?tab=readme-ov-file",
  },
];

export { services, technologies, experiences, testimonials, projects };
