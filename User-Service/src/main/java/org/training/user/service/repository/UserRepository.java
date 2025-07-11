package org.training.user.service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.training.user.service.model.entity.User;
import org.training.user.service.model.Status;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their authentication ID.
     *
     * @param  authId  the authentication ID of the user
     * @return         an optional containing the user if found, otherwise empty
     */
    Optional<User> findUserByAuthId(String authId);

    Optional<User> findByIdentity(String identity);

    /**
     * Finds users with dynamic filtering based on multiple criteria.
     *
     * @param firstName    the first name to filter by (optional)
     * @param lastName     the last name to filter by (optional)
     * @param emailId      the email to filter by (optional)
     * @param contactNo    the contact number to filter by (optional)
     * @param status       the status to filter by (optional)
     * @param identity     the identity number to filter by (optional)
     * @param gender       the gender to filter by (optional)
     * @param occupation   the occupation to filter by (optional)
     * @param nationality  the nationality to filter by (optional)
     * @return             a list of users matching the filter criteria
     */
    @Query("SELECT u FROM User u JOIN u.userProfile up " +
           "WHERE (:firstName IS NULL OR LOWER(up.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) " +
           "AND (:lastName IS NULL OR LOWER(up.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) " +
           "AND (:emailId IS NULL OR LOWER(u.emailId) LIKE LOWER(CONCAT('%', :emailId, '%'))) " +
           "AND (:contactNo IS NULL OR LOWER(u.contactNo) LIKE LOWER(CONCAT('%', :contactNo, '%'))) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:identity IS NULL OR LOWER(u.identity) LIKE LOWER(CONCAT('%', :identity, '%'))) " +
           "AND (:gender IS NULL OR LOWER(up.gender) LIKE LOWER(CONCAT('%', :gender, '%'))) " +
           "AND (:occupation IS NULL OR LOWER(up.occupation) LIKE LOWER(CONCAT('%', :occupation, '%'))) " +
           "AND (:nationality IS NULL OR LOWER(up.nationality) LIKE LOWER(CONCAT('%', :nationality, '%')))")
    List<User> findUsersWithFilters(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("emailId") String emailId,
            @Param("contactNo") String contactNo,
            @Param("status") Status status,
            @Param("identity") String identity,
            @Param("gender") String gender,
            @Param("occupation") String occupation,
            @Param("nationality") String nationality
    );
}
