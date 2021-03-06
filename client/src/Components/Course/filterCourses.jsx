import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import FilterBox from "./filterBox";
import SearchBox from "./searchBox";
import DivCourseList from "./divCourseList";
import Pagination from "./paginate";
import { useSelector, useDispatch } from "react-redux";
import getCategories from "../../Action/getCategories";
import filterCourses from "../../Action/filterCourses";

const FilterCourses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPages] = useState(6);

  const Filtercourses = useSelector((state) => state.filterCourses);
  const courses = useSelector((state) => state.courses);
  const categories = useSelector((state) => state.Categories);
  const dis = useDispatch();

  useEffect(() => {
    dis(getCategories());
    return () => {
      dis({ type: "RESET_FILTER_COURSES" });
      dis({ type: "RESET_CATEGORIES" });
    };
  }, []);

  const lastIndex = currentPage * perPages;
  const firstIndex = lastIndex - perPages;
  const currentCourses = Filtercourses.slice(firstIndex, lastIndex);

  function changeCurrentPage(number) {
    setCurrentPage(number);
  }

  function radioChange(e) {
    let value = e.target.defaultValue;
    dis(filterCourses(value, null, null));
  }

  return (
    <div className="filter-courses-list">
      <div className="filter-search-box">
        <FilterBox />
        <SearchBox />
      </div>

      <div className="course-filter">
        <div className="course-filterd-container">
          {isEmpty(Filtercourses)
            ? courses.map((item) => {
                return (
                  <DivCourseList
                    imgSrc={item.imgSrc}
                    title={item.title}
                    key={item.uuid}
                    courseTime={item.courseTime}
                    teacher={item.teacher}
                    price={item.price}
                    className="course-div in-filter"
                  />
                );
              })
            : currentCourses.map((item) => {
                return (
                  <DivCourseList
                    imgSrc={item.imgSrc}
                    title={item.title}
                    key={item.uuid}
                    courseTime={item.courseTime}
                    teacher={item.teacher}
                    price={item.price}
                    className="course-div in-filter"
                  />
                );
              })}
        </div>
        <Pagination
          perPage={perPages}
          totalCourse={Filtercourses.length}
          changePage={changeCurrentPage}
        />
      </div>

      <div className="filter-option-container">
        <FormControl
          style={{ padding: "40px", border: "2px gray solid" }}
          component="fieldset"
        >
          <FormLabel component="legend">Categories</FormLabel>
          <RadioGroup aria-label="Categories" name="categories">
            {!isEmpty(categories)
              ? categories.map((item) => {
                  return (
                    <FormControlLabel
                      onChange={radioChange}
                      value={item.title}
                      control={<Radio />}
                      label={item.title}
                    />
                  );
                })
              : ""}
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
};

export default FilterCourses;
