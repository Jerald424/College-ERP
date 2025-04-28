import { Carousel } from "antd";

export default function DashboardCarousal() {
  return (
    <Carousel autoplay>
      <div style={{ height: "250px" }}>
        <img
          src="https://img.freepik.com/free-vector/children-eat-school-canteen_107791-2270.jpg?t=st=1720175616~exp=1720179216~hmac=8ca473174427d9cbb0d9b079a190bc36048fd9faf4024224d94abad8e73e0738&w=826"
          style={{ height: "250px", width: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ height: "250px" }}>
        <img
          src="https://img.freepik.com/free-vector/kids-washing-hands-stand-queue-home-bathroom_107791-1878.jpg?t=st=1720175651~exp=1720179251~hmac=87cb656b92b8a2781d871fbbe3531a6b25e0a7d585519d5dbb6d97847f474236&w=826"
          style={{ height: "250px", width: "100%", objectFit: "cover" }}
        />
      </div>{" "}
      <div style={{ height: "250px" }}>
        <img src="https://img.freepik.com/premium-photo/academic-caps-air-graduation-selective-focus_73944-47509.jpg?w=826" style={{ height: "250px", width: "100%", objectFit: "cover" }} />
      </div>{" "}
      <div style={{ height: "250px" }}>
        <img
          src="https://img.freepik.com/free-vector/cartoon-students-front-college-campus-building_88138-733.jpg?t=st=1720175728~exp=1720179328~hmac=9530a1d73d3310de793e9194f62bf2b021c2da6fc0438c1a2049f70406ab22a3&w=826"
          style={{ height: "250px", width: "100%", objectFit: "cover" }}
        />
      </div>{" "}
      <div style={{ height: "250px" }}>
        <img
          src="https://img.freepik.com/free-photo/portrait-young-asian-woman-sitting-park-near-tree-working-laptop-using-computer-outdoors_1258-203688.jpg?t=st=1720175759~exp=1720179359~hmac=5f60d7fdb782bb193bdae5a84ac92c8ef0cc94622b75f2582be051a19954b13e&w=826"
          style={{ height: "250px", width: "100%", objectFit: "cover" }}
        />
      </div>
    </Carousel>
  );
}
